"use client";

import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, Info, AlertTriangle, X, Sparkles } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "info" | "warning" | "ai";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 3500
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Individual Toast Item ────────────────────────────────────────────────────

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  ai: Sparkles,
};

const STYLES: Record<
  ToastType,
  { icon: string; bar: string; bg: string; border: string }
> = {
  success: {
    icon: "text-india-green-500",
    bar: "bg-india-green-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-india-green-200 dark:border-india-green-900/50",
  },
  info: {
    icon: "text-blue-500",
    bar: "bg-blue-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-blue-200 dark:border-blue-900/50",
  },
  warning: {
    icon: "text-saffron-500",
    bar: "bg-saffron-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-saffron-200 dark:border-saffron-500/30",
  },
  ai: {
    icon: "text-purple-500",
    bar: "bg-linear-to-r from-saffron-500 to-purple-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-purple-200 dark:border-purple-900/50",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const duration = toast.duration ?? 3500;
  const Icon = ICONS[toast.type];
  const style = STYLES[toast.type];

  useEffect(() => {
    // mount animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timerRef.current);
  }, [duration]);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 320);
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex w-80 max-w-[calc(100vw-32px)] items-start gap-3
        overflow-hidden rounded-2xl border shadow-lg shadow-black/10
        transition-all duration-300
        ${style.bg} ${style.border}
        ${visible && !leaving
          ? "translate-x-0 opacity-100"
          : "translate-x-4 opacity-0"}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`} />

      <div className="flex flex-1 items-start gap-3 px-4 py-3.5 pl-5">
        <div className={`mt-0.5 shrink-0 ${style.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="mt-0.5 shrink-0 rounded-lg p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-[200] flex flex-col gap-2.5 lg:bottom-6 lg:right-6"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
