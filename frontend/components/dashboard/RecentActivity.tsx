"use client";

import Link from "next/link";
import { Clock, MessageSquare, Target, FileText, Globe2, Wand2, Trash2, Bookmark, Sparkles, Newspaper, Hash, BookOpen, Scale, DollarSign, CheckCircle2 } from "lucide-react";
import { useActivityStore, type ActivityKind } from "@/store/activity";

const kindMeta: Partial<Record<ActivityKind, { icon: typeof Clock; color: string; label: string }>> = {
  chat: { icon: MessageSquare, color: "text-orange-500", label: "AI Chat" },
  "chat-thread-created": { icon: MessageSquare, color: "text-orange-400", label: "New Thread" },
  readiness: { icon: Target, color: "text-saffron-500", label: "Readiness Score" },
  "readiness-completed": { icon: Target, color: "text-saffron-600", label: "Readiness Done" },
  checklist: { icon: FileText, color: "text-blue-500", label: "Doc Checklist" },
  "checklist-generated": { icon: FileText, color: "text-blue-600", label: "Checklist Generated" },
  fta: { icon: Globe2, color: "text-purple-500", label: "FTA Advantage" },
  "fta-calculated": { icon: Globe2, color: "text-purple-600", label: "FTA Calculated" },
  "scheme-wizard": { icon: Wand2, color: "text-green-500", label: "Find My Schemes" },
  "scheme-browse": { icon: Wand2, color: "text-green-400", label: "Browse Schemes" },
  "scheme-matched": { icon: Wand2, color: "text-green-600", label: "Scheme Matched" },
  "scheme-saved": { icon: Bookmark, color: "text-green-500", label: "Scheme Saved" },
  "hs-lookup": { icon: Hash, color: "text-purple-500", label: "HS Lookup" },
  glossary: { icon: BookOpen, color: "text-blue-500", label: "Glossary" },
  compare: { icon: Scale, color: "text-rose-500", label: "Compare" },
  pricing: { icon: DollarSign, color: "text-amber-500", label: "Pricing" },
  countries: { icon: Globe2, color: "text-cyan-500", label: "Countries" },
  "country-viewed": { icon: Globe2, color: "text-cyan-600", label: "Country Viewed" },
  saved: { icon: Bookmark, color: "text-violet-500", label: "Saved" },
  research: { icon: Sparkles, color: "text-indigo-500", label: "Research" },
  "research-query": { icon: Sparkles, color: "text-indigo-600", label: "Research Query" },
  updates: { icon: Newspaper, color: "text-teal-500", label: "News" },
  "milestone-completed": { icon: CheckCircle2, color: "text-india-green-500", label: "Milestone" },
};

function relTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RecentActivity() {
  const entries = useActivityStore((s) => s.entries);
  const clear = useActivityStore((s) => s.clear);

  if (entries.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Recent activity
        </h2>
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <Clock className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Your recent activity will appear here
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Chat conversations, readiness scores, and generated checklists
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Recent activity
        </h2>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear activity"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
        {entries.slice(0, 10).map((entry, i) => {
          const meta = kindMeta[entry.kind] ?? { icon: Clock, color: "text-zinc-500", label: entry.kind };
          const Icon = meta.icon;
          return (
            <Link
              key={entry.id}
              href={entry.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                i > 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
              }`}
            >
              <div className={`shrink-0 ${meta.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {entry.label}
                </p>
                <p className="text-xs text-zinc-400">{meta.label}</p>
              </div>
              <span className="shrink-0 text-[11px] text-zinc-400">
                {relTime(entry.ts)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
