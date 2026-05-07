"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Landmark,
  Hash,
  Globe2,
  MessageSquare,
  ExternalLink,
  Trash2,
  ArrowRight,
  Search,
  Pin,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import { useSavedStore } from "@/store/saved";
import { SCHEMES } from "@/app/data/schemes";
import { GLOSSARY_TERMS } from "@/app/data/glossary";
import { Badge } from "@/components/ui/Badge";
import { FilterTabs } from "@/components/ui/FilterTabs";

type Tab = "all" | "schemes" | "terms" | "hs-codes" | "countries" | "chat";

const CATEGORY_COLORS: Record<string, "orange" | "green" | "blue" | "purple" | "amber" | "default"> = {
  "duty-remission": "orange",
  "duty-exemption": "amber",
  financial: "green",
  infrastructure: "blue",
  "market-access": "purple",
  registration: "orange",
  documentation: "blue",
  finance: "green",
  logistics: "purple",
  compliance: "amber",
  organisation: "default",
  scheme: "green",
};

export default function SavedPage() {
  const savedSchemes = useUserStore((s) => s.profile.savedSchemes);
  const savedGlossaryTerms = useUserStore((s) => s.profile.savedGlossaryTerms);
  const savedHsCodes = useUserStore((s) => s.profile.savedHsCodes);
  const savedCountries = useUserStore((s) => s.profile.savedCountries);
  const toggleSavedScheme = useUserStore((s) => s.toggleSavedScheme);
  const toggleSavedGlossaryTerm = useUserStore((s) => s.toggleSavedGlossaryTerm);
  const toggleSavedHsCode = useUserStore((s) => s.toggleSavedHsCode);
  const toggleSavedCountry = useUserStore((s) => s.toggleSavedCountry);

  const savedItems = useSavedStore((s) => s.items);
  const removeItem = useSavedStore((s) => s.removeItem);
  const pinItem = useSavedStore((s) => s.pinItem);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const schemes = useMemo(
    () => SCHEMES.filter((s) => savedSchemes.includes(s.id)),
    [savedSchemes]
  );
  const terms = useMemo(
    () => GLOSSARY_TERMS.filter((t) => savedGlossaryTerms.includes(t.term)),
    [savedGlossaryTerms]
  );

  const chatAnswers = useMemo(
    () => savedItems.filter((i) => i.type === "chat-answer"),
    [savedItems]
  );

  const totalCount =
    schemes.length + terms.length + savedHsCodes.length + savedCountries.length + chatAnswers.length;

  const tabs: { value: Tab; label: string }[] = [
    { value: "all", label: `All (${totalCount})` },
    { value: "schemes", label: `Schemes (${schemes.length})` },
    { value: "terms", label: `Glossary (${terms.length})` },
    { value: "hs-codes", label: `HS Codes (${savedHsCodes.length})` },
    { value: "countries", label: `Countries (${savedCountries.length})` },
    { value: "chat", label: `Chat (${chatAnswers.length})` },
  ];

  const q = search.toLowerCase();

  const filteredSchemes = schemes.filter(
    (s) => !q || s.shortName.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
  );
  const filteredTerms = terms.filter(
    (t) => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
  );
  const filteredHsCodes = savedHsCodes.filter((c) => !q || c.toLowerCase().includes(q));
  const filteredCountries = savedCountries.filter((c) => !q || c.toLowerCase().includes(q));
  const filteredChat = chatAnswers.filter(
    (i) => !q || i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Saved Items
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your bookmarked schemes, glossary terms, HS codes, countries, and chat answers — all in one place.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all saved items..."
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <FilterTabs tabs={tabs} active={tab} onChange={setTab} />

        <div className="mt-6">
          {/* Schemes */}
          {(tab === "all" || tab === "schemes") && filteredSchemes.length > 0 && (
            <div className="mb-8">
              {tab === "all" && (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Landmark className="h-3.5 w-3.5" /> Schemes
                </h3>
              )}
              <div className="flex flex-col gap-4">
                {filteredSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {scheme.shortName}
                          </span>
                          <Badge variant={CATEGORY_COLORS[scheme.category] ?? "default"}>
                            {scheme.category.replace(/-/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {scheme.summary}
                        </p>
                        <p className="mt-2 text-xs font-medium text-india-green-600 dark:text-india-green-500">
                          Benefit: {scheme.benefit}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={scheme.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Open official source"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleSavedScheme(scheme.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove from saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1">
                      {scheme.sectors.slice(0, 5).map((sec) => (
                        <span
                          key={sec}
                          className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Glossary Terms */}
          {(tab === "all" || tab === "terms") && filteredTerms.length > 0 && (
            <div className="mb-8">
              {tab === "all" && (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <BookOpen className="h-3.5 w-3.5" /> Glossary Terms
                </h3>
              )}
              <div className="flex flex-col gap-3">
                {filteredTerms.map((term) => (
                  <div
                    key={term.term}
                    className="rounded-xl bg-white dark:bg-zinc-900 border-l-4 border-l-saffron-400 border border-zinc-200 dark:border-zinc-800 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {term.term}
                          </span>
                          {term.shortForm && (
                            <span className="text-xs text-saffron-600 dark:text-saffron-400 font-medium">
                              ({term.shortForm})
                            </span>
                          )}
                          <Badge variant={CATEGORY_COLORS[term.category] ?? "default"}>
                            {term.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {term.definition}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSavedGlossaryTerm(term.term)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HS Codes */}
          {(tab === "all" || tab === "hs-codes") && filteredHsCodes.length > 0 && (
            <div className="mb-8">
              {tab === "all" && (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Hash className="h-3.5 w-3.5" /> HS Codes
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredHsCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-sm font-mono font-medium text-zinc-900 dark:text-zinc-50">
                        {code}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSavedHsCode(code)}
                      className="p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {(tab === "all" || tab === "countries") && filteredCountries.length > 0 && (
            <div className="mb-8">
              {tab === "all" && (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Globe2 className="h-3.5 w-3.5" /> Countries
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredCountries.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3"
                  >
                    <Link
                      href="/dashboard/countries"
                      className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
                    >
                      <Globe2 className="h-3.5 w-3.5 text-india-green-500" />
                      {code}
                    </Link>
                    <button
                      onClick={() => toggleSavedCountry(code)}
                      className="p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Answers */}
          {(tab === "all" || tab === "chat") && filteredChat.length > 0 && (
            <div className="mb-8">
              {tab === "all" && (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <MessageSquare className="h-3.5 w-3.5" /> Chat Answers
                </h3>
              )}
              <div className="flex flex-col gap-3">
                {filteredChat.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                          {item.body}
                        </p>
                        <p className="mt-2 text-[10px] text-zinc-400">
                          Saved {new Date(item.ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => pinItem(item.id, !item.pinned)}
                          className={`p-1.5 rounded transition-colors ${item.pinned ? "text-saffron-500" : "text-zinc-400 hover:text-saffron-500"}`}
                          title={item.pinned ? "Unpin" : "Pin"}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded text-red-400 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty states */}
          {tab === "all" && totalCount === 0 && (
            <EmptyState
              icon={Bookmark}
              title="No saved items yet"
              desc="Bookmark schemes, glossary terms, HS codes, country profiles, and chat answers across the platform."
              href="/dashboard"
              linkText="Explore Dashboard"
            />
          )}
          {tab === "schemes" && filteredSchemes.length === 0 && (
            <EmptyState
              icon={Landmark}
              title="No schemes saved"
              desc="Browse government export incentive schemes and bookmark the ones relevant to your business."
              href="/dashboard/schemes"
              linkText="Browse Schemes"
            />
          )}
          {tab === "terms" && filteredTerms.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No glossary terms saved"
              desc="Browse the export glossary and bookmark terms you want quick access to."
              href="/dashboard/glossary"
              linkText="Browse Glossary"
            />
          )}
          {tab === "hs-codes" && filteredHsCodes.length === 0 && (
            <EmptyState
              icon={Hash}
              title="No HS codes saved"
              desc="Look up HS codes for your products and save them for reference."
              href="/dashboard/hs-codes"
              linkText="HS Code Lookup"
            />
          )}
          {tab === "countries" && filteredCountries.length === 0 && (
            <EmptyState
              icon={Globe2}
              title="No countries saved"
              desc="Explore country profiles and save your target markets."
              href="/dashboard/countries"
              linkText="Country Profiles"
            />
          )}
          {tab === "chat" && filteredChat.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="No chat answers saved"
              desc="Save valuable AI responses from your conversations for future reference."
              href="/dashboard/chat"
              linkText="Start a Chat"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  href,
  linkText,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <div>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-base">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
          {desc}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron-500 text-white text-sm font-semibold hover:bg-saffron-600 transition-colors"
      >
        {linkText}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
