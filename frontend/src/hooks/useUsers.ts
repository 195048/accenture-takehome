import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

// Fetches the list of authors. TanStack Query handles caching, loading and
// error states for us — the component just reads what this returns.
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: api.getUsers,
  });
}
