"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface ReadinessActionPlanProps {
  content: string;
  loading: boolean;
}

export function ReadinessActionPlan({ content, loading }: ReadinessActionPlanProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-saffron-500" />
          Generating your personalised action plan…
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${70 + i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Your personalised action plan
      </h3>
      <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/chat"
          className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
        >
          Ask AI about action #1
        </Link>
        <Link
          href="/dashboard/schemes/wizard"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Find my eligible schemes →
        </Link>
      </div>
    </div>
  );
}
