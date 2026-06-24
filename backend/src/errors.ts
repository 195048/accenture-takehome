// One error type for the whole app. Anywhere in a route we can `throw
// notFound(...)` and trust the error middleware to turn it into the right
// HTTP status + a consistent JSON body. Anything that is NOT an HttpError is
// treated as an unexpected 500.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Semantic helpers for the cases we actually use, so route code reads well.
export const badRequest = (message: string) => new HttpError(400, message, "BAD_REQUEST");
export const notFound = (message: string) => new HttpError(404, message, "NOT_FOUND");
export const badGateway = (message: string) => new HttpError(502, message, "UPSTREAM_ERROR");
export const gatewayTimeout = (message: string) =>
  new HttpError(504, message, "UPSTREAM_TIMEOUT");
