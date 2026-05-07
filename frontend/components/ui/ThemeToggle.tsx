"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "@/store/theme";

const cycle: Theme[] = ["light", "dark", "system"];

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const labels = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
} as const;

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const next = () => {
    const idx = cycle.indexOf(theme);
    setTheme(cycle[(idx + 1) % cycle.length]);
  };

  const Icon = icons[theme];

  return (
    <button
      onClick={next}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
