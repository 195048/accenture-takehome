import { Link } from "react-router-dom";
import type { Post } from "../lib/types";

function excerpt(body: string, max = 140): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export default function PostCard({ post, authorName }: { post: Post; authorName: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/posts/${post.id}`}>
        <h2 className="font-semibold capitalize hover:underline">{post.title}</h2>
      </Link>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">by {authorName}</p>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{excerpt(post.body)}</p>
    </article>
  );
}
