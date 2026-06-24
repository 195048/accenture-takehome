import { Router } from "express";
import { z } from "zod";
import { getUsers, getPosts } from "../upstream";
import { badRequest, notFound } from "../errors";
import type { UserWithPosts } from "../types";

export const usersRouter = Router();

// A path id must be a positive integer. z.coerce turns the URL string ("3")
// into a number before validating.
const idParam = z.coerce.number().int().positive();

// GET /api/users — list every author.
usersRouter.get("/", async (_req, res) => {
  const users = await getUsers();
  res.json(users);
});

// GET /api/users/:id — one author, enriched with the posts they wrote.
usersRouter.get("/:id", async (req, res) => {
  const parsed = idParam.safeParse(req.params.id);
  if (!parsed.success) {
    throw badRequest("user id must be a positive integer");
  }
  const id = parsed.data;

  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw notFound(`user ${id} not found`);
  }

  const posts = await getPosts();
  const result: UserWithPosts = {
    ...user,
    posts: posts.filter((p) => p.userId === id),
  };
  res.json(result);
});
