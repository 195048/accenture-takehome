import express, { type Express } from "express";
import cors from "cors";
import { usersRouter } from "./routes/users";
import { postsRouter } from "./routes/posts";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./errors";

// Builds and configures the Express app WITHOUT starting a server. Keeping
// createApp() separate from listen() (in index.ts) is what makes the API
// testable: supertest can import this app and fire requests at it in-process,
// with no real port involved.
export function createApp(): Express {
  const app = express();

  app.use(cors());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/users", usersRouter);
  app.use("/api/posts", postsRouter);

  // Any unmatched route → 404 in our consistent error shape.
  app.use((_req, _res, next) => next(notFound("route not found")));

  // The error handler must be registered LAST, after all routes.
  app.use(errorHandler);

  return app;
}
