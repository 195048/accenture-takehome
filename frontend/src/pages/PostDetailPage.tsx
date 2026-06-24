import { Link, useParams } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const valid = Number.isInteger(postId) && postId > 0;

  const { data: post, isLoading, isError, error, refetch } = usePost(postId);

  return (
    <section>
      <Link to="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to feed
      </Link>

      {!valid && (
        <div className="mt-4">
          <ErrorMessage message={`"${id}" is not a valid post id`} />
        </div>
      )}

      {valid && isLoading && <Loading label="Loading post…" />}

      {valid && isError && (
        <div className="mt-4">
          <ErrorMessage
            message={error?.message ?? "Could not load post"}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {post && (
        <article className="mt-4">
          <h1 className="text-2xl font-bold capitalize tracking-tight">{post.title}</h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            by{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {post.author.name}
            </span>{" "}
            ·{" "}
            <a href={`mailto:${post.author.email}`} className="hover:underline">
              {post.author.email}
            </a>{" "}
            · {post.author.company.name}
          </p>

          <p className="mt-4 leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
            {post.body}
          </p>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Comments ({post.comments.length})</h2>
            <ul className="mt-4 space-y-4">
              {post.comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium capitalize">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.email}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{c.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </section>
  );
}
