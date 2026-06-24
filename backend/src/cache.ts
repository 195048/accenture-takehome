import NodeCache from "node-cache";
import { config } from "./config";

// A single in-memory cache for the whole process. node-cache evicts entries
// automatically once they pass the TTL, so we never serve very stale data.
const cache = new NodeCache({ stdTTL: config.cacheTtlSeconds });

// Read-through cache: return the cached value if we have it, otherwise run
// `loader`, remember its result, and return it. Callers don't need to know
// whether the data came from memory or from the upstream API.
export async function getOrFetch<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) return cached;

  const fresh = await loader();
  cache.set(key, fresh);
  return fresh;
}

// Lets tests start from a clean slate.
export function clearCache(): void {
  cache.flushAll();
}
