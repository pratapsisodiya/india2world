import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  _resolveAndApply: (t: Theme) => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      resolvedTheme: "light",
      setTheme: (t: Theme) => {
        get()._resolveAndApply(t);
      },
      _resolveAndApply: (t: Theme) => {
        const resolved = t === "system" ? getSystemTheme() : t;
        applyThemeToDOM(resolved);
        set({ theme: t, resolvedTheme: resolved });
      },
    }),
    {
      name: "india2world-theme",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._resolveAndApply(state.theme);
        }
      },
    }
  )
);
