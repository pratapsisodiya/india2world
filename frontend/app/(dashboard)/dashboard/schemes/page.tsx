"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MessageSquare, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { SCHEMES, type Scheme } from "@/app/data/schemes";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

type Category = Scheme["category"] | "all";

const categoryTabs: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "duty-remission", label: "Duty Remission" },
  { value: "duty-exemption", label: "Duty Exemption" },
  { value: "financial", label: "Financial" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "market-access", label: "Market Access" },
];

const categoryColors: Record<string, string> = {
  "duty-remission": "orange",
  "duty-exemption": "blue",
  financial: "green",
  infrastructure: "purple",
  "market-access": "amber",
};

function getCategoryCounts() {
  const counts: Record<string, number> = {};
  for (const s of SCHEMES) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return counts;
}

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const sector = useUserStore((s) => s.profile.sector);
  const savedSchemes = useUserStore((s) => s.profile.savedSchemes ?? []);
  const toggleSavedScheme = useUserStore((s) => s.toggleSavedScheme);

  const handleSearch = useCallback((v: string) => setSearch(v), []);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  const tabsWithCounts = useMemo(
    () =>
      categoryTabs.map((t) => ({
        ...t,
        label:
          t.value === "all"
            ? `All (${SCHEMES.length})`
            : `${t.label} (${categoryCounts[t.value] || 0})`,
      })),
    [categoryCounts]
  );

  const recommended = useMemo(() => {
    if (!sector) return [];
    return SCHEMES.filter((s) =>
      s.sectors.some((sec) => sec.toLowerCase().includes(sector.toLowerCase().split(" ")[0]))
    );
  }, [sector]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SCHEMES.filter((s) => {
      if (showSaved && !savedSchemes.includes(s.id)) return false;
      if (category !== "all" && s.category !== category) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      );
    });
  }, [search, category, showSaved, savedSchemes]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Government Schemes
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {SCHEMES.length} export incentive schemes — duty remission,
              exemptions, financial support, and market access.
            </p>
            {savedSchemes.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSaved((v) => !v)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  showSaved
                    ? "bg-saffron-100 text-saffron-700 dark:bg-saffron-500/20 dark:text-saffron-300"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                )}
              >
                <BookmarkCheck className="h-3.5 w-3.5" />
                Saved ({savedSchemes.length})
              </button>
            )}
          </div>
        </div>

        {/* Find My Schemes banner */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl bg-gradient-to-r from-saffron-500/10 to-india-green-500/10 p-5 ring-1 ring-saffron-500/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Not sure which schemes you qualify for?
            </p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              Answer 5 questions and get matched to eligible schemes with personalised claim steps.
            </p>
          </div>
          <Link
            href="/dashboard/schemes/wizard"
            className="shrink-0 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
          >
            Find My Schemes →
          </Link>
        </div>

        {/* Recommended for your sector */}
        {recommended.length > 0 && !search && category === "all" && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Recommended for {sector}
            </h2>
            <div className="flex flex-col gap-3">
              {recommended.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                  className="flex items-center gap-4 rounded-xl border-l-3 border-l-saffron-500 bg-gradient-to-r from-saffron-50/50 to-transparent p-5 text-left ring-1 ring-saffron-200/50 transition-all hover:shadow-sm dark:from-saffron-500/5 dark:to-transparent dark:ring-saffron-500/10"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {scheme.shortName}
                      </h3>
                      <Badge variant={categoryColors[scheme.category] as "default"}>
                        {scheme.category.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {scheme.summary}
                    </p>
                  </div>
                  {expandedId === scheme.id ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search schemes..."
            />
          </div>
          <FilterTabs tabs={tabsWithCounts} active={category} onChange={setCategory} />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No schemes found.
            </p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              Try searching for &ldquo;duty&rdquo;, &ldquo;drawback&rdquo;, or &ldquo;credit&rdquo;
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((scheme) => {
              const expanded = expandedId === scheme.id;
              return (
                <div
                  key={scheme.id}
                  className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expanded ? null : scheme.id)
                    }
                    className="flex w-full items-start gap-4 p-5 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {scheme.shortName}
                        </h3>
                        <Badge
                          variant={
                            categoryColors[scheme.category] as "default"
                          }
                        >
                          {scheme.category.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {scheme.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {scheme.summary}
                      </p>
                    </div>
                    {expanded ? (
                      <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-5 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Eligibility
                          </h4>
                          <ul className="space-y-1.5">
                            {scheme.eligibility.map((e, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                                {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Benefit
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {scheme.benefit}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            How to claim
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {scheme.howToClaim}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Apply at
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {scheme.applyAt}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {scheme.sectors.map((s) => (
                          <Badge key={s} variant="default">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/dashboard/chat?q=Tell me more about the ${scheme.shortName} scheme — eligibility, benefits, and how to claim.`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Ask AI about this
                        </Link>
                        <a
                          href={scheme.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Official link
                        </a>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSavedScheme(scheme.id); }}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                            savedSchemes.includes(scheme.id)
                              ? "border-saffron-300 bg-saffron-50 text-saffron-700 dark:border-saffron-700 dark:bg-saffron-500/10 dark:text-saffron-400"
                              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          )}
                        >
                          {savedSchemes.includes(scheme.id) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                          {savedSchemes.includes(scheme.id) ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
