"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Copy, Check, Sparkles, X, Loader2 } from "lucide-react";
import { HS_CHAPTERS } from "@/app/data/hsCodes";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface HsMatch {
  chapter: string;
  heading: string;
  chapterTitle: string;
  headingDescription: string;
  confidence: number;
  reasoning: string;
  itcHsNote: string;
  regulatoryFlags: string[];
}

interface HsClassifyResult {
  topMatches: HsMatch[];
  clarificationNeeded?: string;
  generalGuidance: string;
  verifyAt: string;
}

const CHAPTER_GROUPS = [
  { label: "Agriculture & Food", emoji: "🌾", range: [7, 24] },
  { label: "Minerals & Chemicals", emoji: "🧪", range: [25, 38] },
  { label: "Leather", emoji: "👜", range: [41, 43] },
  { label: "Wood & Paper", emoji: "🪵", range: [44, 49] },
  { label: "Textiles & Apparel", emoji: "🧵", range: [50, 63] },
  { label: "Ceramics & Glass", emoji: "🏺", range: [68, 70] },
  { label: "Gems, Jewellery & Metals", emoji: "💎", range: [71, 83] },
  { label: "Machinery & Engineering", emoji: "⚙️", range: [84, 90] },
  { label: "Miscellaneous", emoji: "📦", range: [91, 99] },
];

const POPULAR_SEARCHES = ["spices", "textiles", "pharma", "rice", "gems", "leather", "cotton", "machinery"];

function getChapterNum(chapter: string): number {
  return parseInt(chapter, 10);
}

function CopyChapterButton({ chapter }: { chapter: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(chapter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy chapter number"
      className="ml-1 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />}
    </button>
  );
}

export default function HsCodesPage() {
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<HsClassifyResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const aiInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((v: string) => setSearch(v), []);

  async function handleAiClassify() {
    const q = aiQuery.trim();
    if (!q) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/hs/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productDescription: q }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Server error ${resp.status}`);
      }
      const data: HsClassifyResult = await resp.json();
      setAiResult(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Classification failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return HS_CHAPTERS;
    return HS_CHAPTERS.filter(
      (ch) =>
        ch.chapter.includes(q) ||
        ch.title.toLowerCase().includes(q) ||
        ch.keywords.some((k) => k.includes(q)) ||
        ch.examples.some((e) => e.toLowerCase().includes(q))
    );
  }, [search]);

  const isDefaultView = !search;

  const grouped = useMemo(() => {
    if (!isDefaultView) return null;
    return CHAPTER_GROUPS.map((group) => ({
      ...group,
      chapters: HS_CHAPTERS.filter((ch) => {
        const num = getChapterNum(ch.chapter);
        return num >= group.range[0] && num <= group.range[1];
      }),
    })).filter((g) => g.chapters.length > 0);
  }, [isDefaultView]);

  const renderCard = (ch: (typeof HS_CHAPTERS)[number]) => (
    <div
      key={ch.chapter}
      className="group flex flex-col rounded-xl bg-white p-5 ring-1 ring-zinc-200 transition-all hover:ring-zinc-300 hover:shadow-sm dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            {ch.chapter}
          </span>
          <CopyChapterButton chapter={ch.chapter} />
        </div>
        <h3 className="flex-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {ch.title}
        </h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ch.examples.slice(0, 4).map((ex) => (
          <Badge key={ex} variant="default">
            {ex}
          </Badge>
        ))}
      </div>
      {ch.notes && (
        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {ch.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            HS Code Lookup
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Find the right ITC-HS chapter for your product. Search by product
            name, keyword, or chapter number.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by product, keyword, or chapter..."
            />
          </div>
          <button
            type="button"
            onClick={() => { setShowAiPanel((v) => !v); setTimeout(() => aiInputRef.current?.focus(), 50); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Sparkles className="h-4 w-4" />
            Classify with AI
          </button>
        </div>

        {/* AI Classify Panel */}
        {showAiPanel && (
          <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">AI HS Code Classifier</h2>
              <button
                type="button"
                onClick={() => { setShowAiPanel(false); setAiResult(null); setAiError(null); }}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-zinc-500">Describe your product and the AI will suggest the most likely ITC-HS chapters and headings.</p>
            <div className="flex gap-2">
              <input
                ref={aiInputRef}
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiClassify()}
                placeholder="e.g. handmade cotton kurtas for women"
                className="h-10 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={handleAiClassify}
                disabled={aiLoading || !aiQuery.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-saffron-500 px-4 text-sm font-medium text-white transition-colors hover:bg-saffron-600 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Classify
              </button>
            </div>

            {aiError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{aiError}</p>
            )}

            {aiResult && (
              <div className="mt-4 space-y-3">
                {aiResult.topMatches.map((match, i) => (
                  <div key={i} className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Chapter {match.chapter} › Heading {match.heading}</span>
                        <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">{match.chapterTitle}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{match.headingDescription}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        match.confidence >= 80 ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" :
                        match.confidence >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" :
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}>
                        {match.confidence}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{match.reasoning}</p>
                    {match.regulatoryFlags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {match.regulatoryFlags.map((flag, j) => (
                          <span key={j} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-400">{flag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {aiResult.clarificationNeeded && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">💡 {aiResult.clarificationNeeded}</p>
                )}
                <p className="text-xs text-zinc-400">{aiResult.generalGuidance} — Verify at <Link href={aiResult.verifyAt} target="_blank" className="underline hover:text-zinc-600">{aiResult.verifyAt}</Link></p>
              </div>
            )}
          </div>
        )}

        {/* Popular searches */}
        {isDefaultView && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setSearch(term)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-saffron-100 hover:text-saffron-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-saffron-500/15 dark:hover:text-saffron-400"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No chapters found. Try a different search term or ask the AI agent.
            </p>
          </div>
        ) : grouped ? (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.label}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="text-base">{group.emoji}</span>
                  {group.label}
                  <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                    Ch. {group.range[0]}-{group.range[1]}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.chapters.map(renderCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
}
