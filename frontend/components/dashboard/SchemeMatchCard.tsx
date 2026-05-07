"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Scheme } from "@/app/data/schemes";
import { cn } from "@/lib/cn";

interface MatchedScheme extends Scheme {
  matchStrength: "strong" | "partial";
  estimatedBenefit: string;
  personalizedSteps?: string;
}

interface SchemeMatchCardProps {
  scheme: MatchedScheme;
  loading?: boolean;
}

export function SchemeMatchCard({ scheme, loading }: SchemeMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              scheme.matchStrength === "strong"
                ? "bg-india-green-50 text-india-green-700 dark:bg-india-green-500/15 dark:text-india-green-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            )}>
              {scheme.matchStrength === "strong" ? "✓ Eligible" : "~ Likely eligible"}
            </span>
            <span className="text-xs text-zinc-500">{scheme.shortName}</span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{scheme.name}</h3>
          <p className="mt-1 text-xs text-zinc-500">{scheme.estimatedBenefit}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{scheme.summary}</p>

          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${75 + i * 5}%` }} />
              ))}
            </div>
          ) : scheme.personalizedSteps ? (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Personalised claim steps
              </h4>
              <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{scheme.personalizedSteps}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">How to claim</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{scheme.howToClaim}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/dashboard/chat?q=How do I claim ${scheme.shortName}?`}
              className="rounded-lg bg-saffron-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-saffron-600"
            >
              Ask AI about {scheme.shortName}
            </a>
            <a
              href={scheme.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Official site <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export type { MatchedScheme };
