import type { Page, Post, PostWithDetails, User, UserWithPosts } from "./types";

// Where the backend lives. Defaults to local dev; override with VITE_API_URL
// (e.g. when the frontend is deployed and the API is on another host).
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// The single place that talks to our backend. On any non-2xx it throws an
// Error carrying the backend's own message ({ error: { message } }), which
// TanStack Query then exposes as an error state to the components.
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* response had no JSON body — keep the default message */
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export interface PostsQuery {
  userId?: number;
  page?: number;
  pageSize?: number;
}

export const api = {
  getUsers: () => getJson<User[]>("/users"),
  getUser: (id: number) => getJson<UserWithPosts>(`/users/${id}`),
  getPosts: (query: PostsQuery = {}) => {
    const params = new URLSearchParams();
    if (query.userId != null) params.set("userId", String(query.userId));
    if (query.page != null) params.set("page", String(query.page));
    if (query.pageSize != null) params.set("pageSize", String(query.pageSize));
    const qs = params.toString();
    return getJson<Page<Post>>(`/posts${qs ? `?${qs}` : ""}`);
  },
  getPost: (id: number) => getJson<PostWithDetails>(`/posts/${id}`),
};
