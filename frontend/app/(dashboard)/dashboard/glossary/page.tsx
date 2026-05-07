"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { GLOSSARY_TERMS, type GlossaryTerm } from "@/app/data/glossary";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { Copy, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { useUserStore } from "@/store/user";

type Category = GlossaryTerm["category"] | "all";

const categoryTabs: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "registration", label: "Registration" },
  { value: "documentation", label: "Documentation" },
  { value: "finance", label: "Finance" },
  { value: "logistics", label: "Logistics" },
  { value: "compliance", label: "Compliance" },
  { value: "organisation", label: "Organisation" },
  { value: "scheme", label: "Scheme" },
];

const categoryColors: Record<string, string> = {
  registration: "orange",
  documentation: "blue",
  finance: "green",
  logistics: "purple",
  compliance: "amber",
  organisation: "default",
  scheme: "green",
};

const categoryBorderColors: Record<string, string> = {
  registration: "border-l-orange-400",
  documentation: "border-l-blue-400",
  finance: "border-l-green-400",
  logistics: "border-l-purple-400",
  compliance: "border-l-amber-400",
  organisation: "border-l-zinc-400",
  scheme: "border-l-green-400",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function GlossaryCard({ term, isSaved, onToggleSave }: { term: GlossaryTerm; isSaved: boolean; onToggleSave: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${term.term}: ${term.definition}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "group rounded-xl border-l-3 bg-white p-5 ring-1 ring-zinc-200 transition-all hover:ring-saffron-200 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-saffron-500/20",
        categoryBorderColors[term.category] || "border-l-zinc-400"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {term.term}
          </h3>
          {term.shortForm && (
            <Badge variant={categoryColors[term.category] as "default"}>
              {term.shortForm}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={categoryColors[term.category] as "default"}>
            {term.category}
          </Badge>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy definition"
            className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark term"}
            className="rounded p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-saffron-500" /> : <Bookmark className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {term.definition}
      </p>
    </div>
  );
}

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [showSaved, setShowSaved] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const savedTerms = useUserStore((s) => s.profile.savedGlossaryTerms ?? []);
  const toggleSavedGlossaryTerm = useUserStore((s) => s.toggleSavedGlossaryTerm);

  const handleSearch = useCallback((v: string) => setSearch(v), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GLOSSARY_TERMS.filter((t) => {
      if (showSaved && !savedTerms.includes(t.term)) return false;
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        (t.shortForm?.toLowerCase().includes(q) ?? false) ||
        t.definition.toLowerCase().includes(q)
      );
    });
  }, [search, category, showSaved, savedTerms]);

  const isDefaultView = !search && category === "all" && !showSaved;

  const grouped = useMemo(() => {
    if (!isDefaultView) return null;
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return groups;
  }, [filtered, isDefaultView]);

  const activeLetters = useMemo(() => {
    const set = new Set<string>();
    for (const term of GLOSSARY_TERMS) {
      set.add(term.term[0].toUpperCase());
    }
    return set;
  }, []);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`glossary-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderCard = (term: GlossaryTerm) => (
    <GlossaryCard
      key={term.term}
      term={term}
      isSaved={savedTerms.includes(term.term)}
      onToggleSave={() => toggleSavedGlossaryTerm(term.term)}
    />
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Export Glossary
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {GLOSSARY_TERMS.length} terms covering export registrations,
            documents, finance, logistics, and compliance.
          </p>
        </div>

        {/* Saved terms toggle */}
        {savedTerms.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                showSaved
                  ? "bg-saffron-100 text-saffron-700 dark:bg-saffron-500/20 dark:text-saffron-300"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              )}
            >
              <BookmarkCheck className="h-3.5 w-3.5" />
              Saved ({savedTerms.length})
            </button>
          </div>
        )}

        {/* Alphabet quick-jump */}
        <div className="mb-4 flex flex-wrap gap-1">
          {ALPHABET.map((letter) => {
            const hasTerms = activeLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => hasTerms && scrollToLetter(letter)}
                disabled={!hasTerms}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  hasTerms
                    ? "bg-zinc-100 text-zinc-700 hover:bg-saffron-100 hover:text-saffron-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-saffron-500/15 dark:hover:text-saffron-400"
                    : "text-zinc-300 dark:text-zinc-700"
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search terms..."
            />
          </div>
          <FilterTabs tabs={categoryTabs} active={category} onChange={setCategory} />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No terms found. Try a different search or category.
            </p>
          </div>
        ) : grouped ? (
          <div ref={scrollAreaRef}>
            {ALPHABET.filter((l) => grouped[l]).map((letter) => (
              <div key={letter} id={`glossary-${letter}`}>
                <h2 className="sticky top-0 z-10 mb-3 mt-6 bg-zinc-50 py-2 text-lg font-bold text-zinc-300 first:mt-0 dark:bg-zinc-950 dark:text-zinc-700">
                  {letter}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {grouped[letter].map(renderCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
}
