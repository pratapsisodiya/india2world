"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Globe,
  Loader2,
  Landmark,
  Globe2,
  FileText,
  Truck,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate: string | null;
}

interface SectionData {
  items: NewsItem[];
  fetchedAt: number;
  cached: boolean;
  loading: boolean;
  error: string | null;
}

const SECTIONS = [
  {
    id: "general",
    label: "General Export News",
    desc: "Top headlines on Indian exports and trade",
    icon: Newspaper,
    color: "text-saffron-500 bg-saffron-50 dark:bg-saffron-500/10",
  },
  {
    id: "dgft",
    label: "DGFT Notifications",
    desc: "Recent DGFT public notices and trade circulars",
    icon: FileText,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    id: "schemes",
    label: "Scheme Updates",
    desc: "RoDTEP, EPCG, Advance Authorisation, RoSCTL changes",
    icon: Landmark,
    color: "text-india-green-500 bg-india-green-50 dark:bg-india-green-500/10",
  },
  {
    id: "fta",
    label: "FTA & Trade Agreements",
    desc: "CEPA, ECTA, and global FTA news affecting India",
    icon: Globe2,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
  },
  {
    id: "customs",
    label: "Customs & ICEGATE",
    desc: "Customs duty changes, CBIC notifications, ICEGATE advisories",
    icon: Truck,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const TRUSTED_DOMAINS = new Set([
  "dgft.gov.in",
  "apeda.gov.in",
  "icegate.gov.in",
  "cbic.gov.in",
  "commerce.gov.in",
]);

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function UpdatesPage() {
  const [data, setData] = useState<Record<SectionId, SectionData>>(() => {
    const init = {} as Record<SectionId, SectionData>;
    for (const s of SECTIONS) {
      init[s.id] = { items: [], fetchedAt: 0, cached: false, loading: true, error: null };
    }
    return init;
  });
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchSection = useCallback(async (id: SectionId, refresh = false) => {
    setData((prev) => ({
      ...prev,
      [id]: { ...prev[id], loading: true, error: null },
    }));
    try {
      const url = new URL(`${BACKEND_URL}/api/news/exports`);
      url.searchParams.set("section", id);
      if (refresh) url.searchParams.set("refresh", "1");
      const resp = await fetch(url.toString());
      const json = await resp.json();
      if (!resp.ok) {
        if (resp.status === 503) {
          setGlobalError(json.hint || json.error);
        }
        setData((prev) => ({
          ...prev,
          [id]: {
            items: [],
            fetchedAt: Date.now(),
            cached: false,
            loading: false,
            error: json.error || `Error ${resp.status}`,
          },
        }));
        return;
      }
      setData((prev) => ({
        ...prev,
        [id]: {
          items: json.items || [],
          fetchedAt: json.fetchedAt || Date.now(),
          cached: !!json.cached,
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load news",
        },
      }));
    }
  }, []);

  useEffect(() => {
    SECTIONS.forEach((s) => fetchSection(s.id));
  }, [fetchSection]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Live Export News Feed
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Latest DGFT notifications, FTA updates, and trade news — refreshed via AI agent.
          </p>
        </div>

        {globalError && (
          <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Web search not configured
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">{globalError}</p>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => {
            const sec = data[section.id];
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {section.label}
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{section.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sec.fetchedAt > 0 && (
                      <span className="text-[11px] text-zinc-400 hidden sm:inline">
                        {sec.cached ? "cached · " : ""}
                        {relativeTime(sec.fetchedAt)}
                      </span>
                    )}
                    <button
                      onClick={() => fetchSection(section.id, true)}
                      disabled={sec.loading}
                      className="p-2 rounded-lg text-zinc-400 hover:text-saffron-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${sec.loading ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {sec.loading && sec.items.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400 py-8 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading {section.label.toLowerCase()}…
                    </div>
                  )}

                  {!sec.loading && sec.error && (
                    <div className="text-sm text-red-500 py-4 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {sec.error}
                    </div>
                  )}

                  {!sec.loading && !sec.error && sec.items.length === 0 && (
                    <div className="text-sm text-zinc-400 py-4 text-center">
                      No news items found.
                    </div>
                  )}

                  {sec.items.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sec.items.map((item) => (
                        <NewsCard key={item.url} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-8">
          Powered by AI agent with web search · Cached for 15 minutes per section
        </p>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const isTrusted = TRUSTED_DOMAINS.has(item.source);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-saffron-300 dark:hover:border-saffron-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 shrink-0 text-zinc-400" />
        <span className="truncate text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
          {item.source}
        </span>
        {isTrusted && (
          <span className="rounded-full bg-india-green-100 px-1.5 py-px text-[9px] font-bold text-india-green-700 dark:bg-india-green-500/20 dark:text-india-green-400">
            OFFICIAL
          </span>
        )}
        {item.publishedDate && (
          <span className="ml-auto text-[10px] text-zinc-400">
            {new Date(item.publishedDate).toLocaleDateString()}
          </span>
        )}
        <ExternalLink className="h-3 w-3 text-zinc-300 group-hover:text-saffron-500 transition-colors ml-auto" />
      </div>
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 line-clamp-2 leading-snug">
        {item.title}
      </p>
      {item.snippet && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {item.snippet}
        </p>
      )}
    </a>
  );
}
