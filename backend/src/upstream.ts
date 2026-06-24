import { config } from "./config";
import { getOrFetch } from "./cache";
import { HttpError, badGateway, gatewayTimeout } from "./errors";
import type { User, Post, Comment } from "./types";

// Low-level GET against the upstream API, with a timeout. Any network or HTTP
// problem is converted into one of our HttpErrors, so the rest of the app only
// ever deals with our own error type — never a raw fetch failure.
async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);

  try {
    const res = await fetch(`${config.upstreamBaseUrl}${path}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw badGateway(`upstream responded ${res.status} for ${path}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof HttpError) throw err; // already a clean error, re-throw
    if (err instanceof Error && err.name === "AbortError") {
      throw gatewayTimeout(`upstream timed out for ${path}`);
    }
    throw badGateway(`could not reach upstream for ${path}`);
  } finally {
    clearTimeout(timer);
  }
}

// Each upstream collection is fetched once and cached under its own key
// ("users" / "posts" / "comments"). Routes read from these and do their own
// filtering, pagination and joins in memory — so a page of posts costs at most
// one upstream call, and usually zero.
export function getUsers(): Promise<User[]> {
  return getOrFetch("users", () => fetchJson<User[]>("/users"));
}

export function getPosts(): Promise<Post[]> {
  return getOrFetch("posts", () => fetchJson<Post[]>("/posts"));
}

export function getComments(): Promise<Comment[]> {
  return getOrFetch("comments", () => fetchJson<Comment[]>("/comments"));
}
