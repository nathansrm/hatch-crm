import { createContext } from "react";

/**
 * The app ships a single canonical theme: Obsidian dark chrome.
 * The legacy light theme has been removed, so "dark" is the only value.
 */
export type Theme = "dark";

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);
