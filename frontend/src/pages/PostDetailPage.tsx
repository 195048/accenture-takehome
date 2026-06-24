import { useParams } from "react-router-dom";

export default function PostDetailPage() {
  const { id } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Post #{id}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Full post, author and comments — coming next.
      </p>
    </section>
  );
}
