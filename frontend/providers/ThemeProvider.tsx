"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const _resolveAndApply = useThemeStore((s) => s._resolveAndApply);
  const hasAppliedRef = useRef(false);

  useEffect(() => {
    // Skip first apply if the class is already set from hydration/inline script
    if (!hasAppliedRef.current && document.documentElement.classList.contains("dark") === (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))) {
      hasAppliedRef.current = true;
      return;
    }
    hasAppliedRef.current = true;
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
