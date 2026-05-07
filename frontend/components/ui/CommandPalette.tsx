"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, MessageSquare, BookOpen, Landmark, Hash, Target, FileText, Globe2, Wand2, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const COMMANDS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquare, keywords: ["ask", "question", "chat"] },
  { label: "Export Readiness Score", href: "/dashboard/readiness", icon: Target, keywords: ["score", "assessment", "quiz"] },
  { label: "Find My Schemes", href: "/dashboard/schemes/wizard", icon: Wand2, keywords: ["incentive", "benefit"] },
  { label: "Document Checklist", href: "/dashboard/checklist", icon: FileText, keywords: ["documents", "checklist"] },
  { label: "FTA Advantage", href: "/dashboard/fta", icon: Globe2, keywords: ["fta", "duty", "tariff"] },
  { label: "Government Schemes", href: "/dashboard/schemes", icon: Landmark, keywords: ["rodtep", "epcg", "drawback"] },
  { label: "Export Glossary", href: "/dashboard/glossary", icon: BookOpen, keywords: ["terms", "definition"] },
  { label: "HS Code Lookup", href: "/dashboard/hs-codes", icon: Hash, keywords: ["hs code", "chapter", "classification"] },
  { label: "Settings", href: "/settings", icon: Settings, keywords: ["profile", "theme", "preferences"] },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        return c.label.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q));
      })
    : COMMANDS;

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(0);
  }, [query]);

  function select(href: string) {
    router.push(href);
    onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      select(filtered[activeIdx].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages and tools…"
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
          />
          <kbd className="hidden rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700 sm:block">
            Esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">No results</p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.href}
                  type="button"
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => select(cmd.href)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                    activeIdx === i
                      ? "bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                  {cmd.label}
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-400">
            <kbd className="rounded border border-zinc-200 px-1 py-0.5 font-mono dark:border-zinc-700">↑↓</kbd> navigate &nbsp;
            <kbd className="rounded border border-zinc-200 px-1 py-0.5 font-mono dark:border-zinc-700">↵</kbd> open &nbsp;
            <kbd className="rounded border border-zinc-200 px-1 py-0.5 font-mono dark:border-zinc-700">Esc</kbd> close
          </p>
        </div>
      </div>
    </div>
  );
}
