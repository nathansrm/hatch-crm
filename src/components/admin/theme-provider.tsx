import { useEffect } from "react";

import { ThemeProviderContext, type Theme } from "./theme-context";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

/**
 * Applies the single canonical theme (Obsidian dark chrome).
 *
 * The light/system themes have been removed; this provider simply guarantees
 * the `.dark` class is present on <html> so Tailwind `dark:` variants resolve,
 * and exposes a stable theme context for consumers (e.g. toast styling).
 *
 * @internal
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
  }, []);

  const value = {
    theme: "dark" as Theme,
    setTheme: () => {
      /* no-op: the app is dark-only */
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
