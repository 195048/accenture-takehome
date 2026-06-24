// Central configuration. Everything that might change between environments
// (port, upstream URL, cache lifetime, timeout) lives here instead of being
// scattered as magic values across the code.
export const config = {
  port: Number(process.env.PORT ?? 3001),
  upstreamBaseUrl: "https://jsonplaceholder.typicode.com",
  // Short TTL: absorbs bursts of traffic without letting data go stale.
  cacheTtlSeconds: 60,
  // Give up on a slow upstream instead of hanging the request forever.
  upstreamTimeoutMs: 5000,
} as const;
