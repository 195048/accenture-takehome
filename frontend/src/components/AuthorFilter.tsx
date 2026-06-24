import { useEffect, useRef, useState } from "react";
import type { User } from "../lib/types";

interface AuthorFilterProps {
  authors: User[];
  selectedId?: number;
  onChange: (id: number | undefined) => void;
}

// A searchable author picker. Unlike a plain <select>, you type to filter the
// list — much nicer UX once there are many authors. It still loads the authors
// client-side; the README documents the server-side approach for large sets.
export default function AuthorFilter({ authors, selectedId, onChange }: AuthorFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = authors.find((a) => a.id === selectedId);

  // Close when clicking outside the component.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? authors.filter(
        (a) => a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q),
      )
    : authors;

  function select(id: number | undefined) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 sm:w-56"
      >
        <span className={selected ? "" : "text-slate-500 dark:text-slate-400"}>
          {selected ? selected.name : "All authors"}
        </span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:w-64">
          <div className="p-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              placeholder="Filter authors…"
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <ul className="max-h-56 overflow-auto pb-2" role="listbox">
            <li>
              <button
                type="button"
                onClick={() => select(undefined)}
                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  selectedId == null ? "font-medium text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                All authors
              </button>
            </li>
            {filtered.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => select(a.id)}
                  className={`flex w-full flex-col px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    a.id === selectedId ? "font-medium text-blue-600 dark:text-blue-400" : ""
                  }`}
                >
                  <span>{a.name}</span>
                  <span className="text-xs text-slate-400">@{a.username}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                No authors found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
