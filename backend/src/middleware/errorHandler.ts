import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors";

// Centralised error handler. Express routes it any error thrown in (or passed
// to next() by) a route. We render our own HttpErrors with their status + code;
// anything else is an unexpected bug — logged server-side and returned as a
// generic 500 so we never leak internals to the client.
//
// The unused `next` parameter is required: Express only treats a function as
// error-handling middleware if it declares all four arguments.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ error: { code: "INTERNAL", message: "internal server error" } });
}
