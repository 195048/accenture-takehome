import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

// First paint is handled by the inline script in index.html (no flash). This
// just reads back the decision it already made.
function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Owns the theme: toggles the `dark` class on <html> and remembers the choice
// in localStorage so it sticks across reloads.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
