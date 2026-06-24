import { useUsers } from "../hooks/useUsers";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function UsersPage() {
  const { data: users, isLoading, isError, error, refetch } = useUsers();

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {users ? `${users.length} authors` : "Authors and their details"}
      </p>

      <div className="mt-6">
        {isLoading && <Loading label="Loading users…" />}
        {isError && (
          <ErrorMessage
            message={error?.message ?? "Could not load users"}
            onRetry={() => refetch()}
          />
        )}
        {users && (
          <div className="grid gap-4 sm:grid-cols-2">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
