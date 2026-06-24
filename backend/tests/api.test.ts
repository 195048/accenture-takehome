import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { clearCache } from "../src/cache";

// --- Fixtures: a tiny, predictable slice of "JSONPlaceholder" ---------------
const users = [
  { id: 1, name: "Alice", username: "alice", email: "alice@example.com" },
  { id: 2, name: "Bob", username: "bob", email: "bob@example.com" },
];
const posts = [
  { userId: 1, id: 1, title: "First", body: "body 1" },
  { userId: 1, id: 2, title: "Second", body: "body 2" },
  { userId: 2, id: 3, title: "Third", body: "body 3" },
];
const comments = [
  { postId: 1, id: 1, name: "c1", email: "x@x.com", body: "nice" },
  { postId: 1, id: 2, name: "c2", email: "y@y.com", body: "great" },
  { postId: 3, id: 3, name: "c3", email: "z@z.com", body: "ok" },
];

// A fake `fetch` that returns the fixture matching the requested path, so the
// tests never touch the real network — fast and deterministic.
function fakeFetch() {
  return vi.fn(async (input: string | URL) => {
    const path = new URL(String(input)).pathname;
    const body =
      path === "/users"
        ? users
        : path === "/posts"
          ? posts
          : path === "/comments"
            ? comments
            : [];
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

const app = createApp();
let fetchMock: ReturnType<typeof fakeFetch>;

beforeEach(() => {
  clearCache(); // module-level cache must not leak between tests
  fetchMock = fakeFetch();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/users", () => {
  it("lists users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe("Alice");
  });
});

describe("GET /api/users/:id", () => {
  it("returns a user enriched with their posts", async () => {
    const res = await request(app).get("/api/users/1");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice");
    expect(res.body.posts).toHaveLength(2);
  });

  it("404s when the user is missing", async () => {
    const res = await request(app).get("/api/users/999");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("400s on a non-numeric id", async () => {
    const res = await request(app).get("/api/users/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });
});

describe("GET /api/posts", () => {
  it("paginates", async () => {
    const res = await request(app).get("/api/posts?page=1&pageSize=2");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it("filters by userId", async () => {
    const res = await request(app).get("/api/posts?userId=2");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data.every((p: { userId: number }) => p.userId === 2)).toBe(true);
  });

  it("400s on an invalid query", async () => {
    const res = await request(app).get("/api/posts?page=-1");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/posts/:id", () => {
  it("returns a post enriched with author and comments", async () => {
    const res = await request(app).get("/api/posts/1");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("First");
    expect(res.body.author.name).toBe("Alice");
    expect(res.body.comments).toHaveLength(2);
  });

  it("404s when the post is missing", async () => {
    const res = await request(app).get("/api/posts/999");
    expect(res.status).toBe(404);
  });
});

describe("infrastructure", () => {
  it("404s unknown routes with our error shape", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("maps an upstream failure to 502", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });

  it("caches upstream calls (one fetch for repeated requests)", async () => {
    await request(app).get("/api/users");
    await request(app).get("/api/users");
    const usersCalls = fetchMock.mock.calls.filter(([u]) => String(u).endsWith("/users"));
    expect(usersCalls).toHaveLength(1);
  });
});
