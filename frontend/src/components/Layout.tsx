import { NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Feed
            </NavLink>
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
          </div>
          <ThemeToggle />
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
