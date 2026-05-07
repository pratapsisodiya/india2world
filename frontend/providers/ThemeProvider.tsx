"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const _resolveAndApply = useThemeStore((s) => s._resolveAndApply);

  useEffect(() => {
    _resolveAndApply(theme);
  }, [theme, _resolveAndApply]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => _resolveAndApply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, _resolveAndApply]);

  return <>{children}</>;
}
