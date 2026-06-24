import { Router } from "express";
import { z } from "zod";
import { getPosts, getUsers, getComments } from "../upstream";
import { badRequest, notFound } from "../errors";
import type { Page, Post, PostWithDetails } from "../types";

export const postsRouter = Router();

const idParam = z.coerce.number().int().positive();

// Query params for the posts list. All optional, with sensible defaults.
// z.coerce handles the fact that query values arrive as strings.
const listQuery = z.object({
  userId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// GET /api/posts?userId=&page=&pageSize= — paginated, optionally filtered.
postsRouter.get("/", async (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    throw badRequest("invalid query parameters");
  }
  const { userId, page, pageSize } = parsed.data;

  let posts = await getPosts();
  if (userId !== undefined) {
    posts = posts.filter((p) => p.userId === userId);
  }

  const total = posts.length;
  const start = (page - 1) * pageSize;
  const data = posts.slice(start, start + pageSize);

  const result: Page<Post> = {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
  res.json(result);
});

// GET /api/posts/:id — one post, enriched with its author and its comments.
// This is the "join 3 upstream resources into 1 response" endpoint.
postsRouter.get("/:id", async (req, res) => {
  const parsed = idParam.safeParse(req.params.id);
  if (!parsed.success) {
    throw badRequest("post id must be a positive integer");
  }
  const id = parsed.data;

  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    throw notFound(`post ${id} not found`);
  }

  // Author and comments are independent → fetch them in parallel. After the
  // first request both come straight from the cache.
  const [users, comments] = await Promise.all([getUsers(), getComments()]);
  const author = users.find((u) => u.id === post.userId);
  if (!author) {
    throw notFound(`author for post ${id} not found`);
  }

  const result: PostWithDetails = {
    ...post,
    author,
    comments: comments.filter((c) => c.postId === id),
  };
  res.json(result);
});
