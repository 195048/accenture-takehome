import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { useUsers } from "../hooks/useUsers";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 10;

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : undefined;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const postsQuery = usePosts();
  const usersQuery = useUsers();

  // userId -> author name, for showing the author on each card.
  const authorsById = useMemo(
    () => new Map((usersQuery.data ?? []).map((u): [number, string] => [u.id, u.name])),
    [usersQuery.data],
  );

  // Derive the visible list: filter by author, then by title search.
  const filtered = useMemo(() => {
    let list = postsQuery.data ?? [];
    if (userId) list = list.filter((p) => p.userId === userId);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q));
    return list;
  }, [postsQuery.data, userId, search]);

  // Any filter change sends us back to the first page.
  useEffect(() => {
    setPage(1);
  }, [search, userId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectAuthor(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("userId", value);
      else next.delete("userId");
      return next;
    });
  }

  const isLoading = postsQuery.isLoading || usersQuery.isLoading;
  const isError = postsQuery.isError || usersQuery.isError;

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Feed</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-1"
        />
        <select
          value={userId ?? ""}
          onChange={(e) => selectAuthor(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All authors</option>
          {(usersQuery.data ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading && <Loading label="Loading feed…" />}

        {isError && (
          <ErrorMessage
            message={
              postsQuery.error?.message ?? usersQuery.error?.message ?? "Could not load the feed"
            }
            onRetry={() => {
              postsQuery.refetch();
              usersQuery.refetch();
            }}
          />
        )}

        {!isLoading && !isError && (
          <>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} post{filtered.length === 1 ? "" : "s"}
              {userId && authorsById.has(userId) ? ` by ${authorsById.get(userId)}` : ""}
            </p>

            {pageItems.length === 0 ? (
              <p className="py-8 text-center text-slate-500 dark:text-slate-400">No posts match.</p>
            ) : (
              <div className="space-y-4">
                {pageItems.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorName={authorsById.get(post.userId) ?? "Unknown author"}
                  />
                ))}
              </div>
            )}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}
