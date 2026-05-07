"use client";

import { ExternalLink, Globe } from "lucide-react";

export interface Source {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

const TRUSTED_DOMAINS = new Set([
  "dgft.gov.in",
  "apeda.gov.in",
  "icegate.gov.in",
  "cbic.gov.in",
  "commerce.gov.in",
]);

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Sources ({sources.length})
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((src, i) => {
          const isTrusted = TRUSTED_DOMAINS.has(src.domain);
          return (
            <a
              key={`${src.url}-${i}`}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 transition-colors hover:border-saffron-300 dark:hover:border-saffron-500/50 hover:bg-white dark:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0 text-zinc-400" />
                <span className="truncate text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  {src.domain}
                </span>
                {isTrusted && (
                  <span className="rounded-full bg-india-green-100 px-1.5 py-px text-[9px] font-bold text-india-green-700 dark:bg-india-green-500/20 dark:text-india-green-400">
                    OFFICIAL
                  </span>
                )}
                <ExternalLink className="ml-auto h-3 w-3 text-zinc-300 group-hover:text-saffron-500 transition-colors" />
              </div>
              <p className="line-clamp-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors">
                {src.title}
              </p>
              {src.snippet && (
                <p className="line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  {src.snippet}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
