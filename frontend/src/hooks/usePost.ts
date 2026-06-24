import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

// Fetches one post enriched with its author and comments — the backend joins
// the three upstream resources into a single response, so this is one call.
export function usePost(id: number) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => api.getPost(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
