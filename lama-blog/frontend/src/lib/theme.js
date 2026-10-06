import { useSyncExternalStore } from "react";

// Light/dark theme. Until the reader picks one, the OS setting is followed.
// index.html runs the same resolution inline so the first paint is correct.
const STORAGE_KEY = "theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

const stored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
};

const resolve = () => stored() ?? (media.matches ? "dark" : "light");

const apply = () => {
  const theme = resolve();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  listeners.forEach((listener) => listener());
};

// Follow OS changes only while the reader hasn't chosen.
media.addEventListener("change", () => {
  if (!stored()) apply();
});

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => document.documentElement.dataset.theme || "light";

export const setTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  apply();
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  return {
    theme,
    isDark: theme === "dark",
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
};

apply();
