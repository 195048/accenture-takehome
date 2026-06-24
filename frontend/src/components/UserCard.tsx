import { Link } from "react-router-dom";
import type { User } from "../lib/types";

export default function UserCard({ user }: { user: User }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold">{user.name}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-slate-400">Email</dt>
          <dd className="truncate">{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-slate-400">Company</dt>
          <dd>{user.company.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-slate-400">City</dt>
          <dd>{user.address.city}</dd>
        </div>
      </dl>

      <Link
        to={`/?userId=${user.id}`}
        className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        View posts →
      </Link>
    </article>
  );
}
