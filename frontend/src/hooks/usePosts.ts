import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

// Fetches the full list of posts in one call (the dataset is small — 100 posts)
// and caches it. The feed then searches / filters / paginates this list on the
// client for instant interactions. The backend keeps server-side pagination &
// filtering for larger datasets (see README tradeoffs).
export function usePosts() {
  return useQuery({
    queryKey: ["posts", "all"],
    queryFn: async () => {
      const page = await api.getPosts({ pageSize: 100 });
      return page.data;
    },
  });
}
