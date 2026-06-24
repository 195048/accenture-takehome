import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="text-center">
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline dark:text-blue-400">
        Back to feed
      </Link>
    </section>
  );
}
