"use client";

import { useState, useMemo } from "react";
import {
  ReceiptIndianRupee,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  Calculator,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { RODTEP_DATA, type RodtepEntry } from "@/app/data/rodtepData";

function fmtCr(val: number) {
  if (!isFinite(val) || val === 0) return "—";
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`;
  return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function RodtepPage() {
  const [query, setQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fobValue, setFobValue] = useState("");

  const chapters = useMemo(() => {
    const seen = new Set<number>();
    return RODTEP_DATA.filter((e) => { if (seen.has(e.chapter)) return false; seen.add(e.chapter); return true; })
      .map((e) => ({ chapter: e.chapter, title: e.chapterTitle }))
      .sort((a, b) => a.chapter - b.chapter);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return RODTEP_DATA.filter((e) => {
      const matchChapter = selectedChapter == null || e.chapter === selectedChapter;
      if (!matchChapter) return false;
      if (!q) return true;
      return (
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q)) ||
        e.chapterTitle.toLowerCase().includes(q) ||
        (e.hsCode ?? "").includes(q) ||
        String(e.chapter) === q
      );
    });
  }, [query, selectedChapter]);

  const fob = parseFloat(fobValue) || 0;

  const calcCredit = (entry: RodtepEntry) => {
    const avgRate = (entry.rodtepMin + entry.rodtepMax) / 2 / 100;
    return fob * avgRate;
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ReceiptIndianRupee className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              RoDTEP & Duty Drawback Rate Finder
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Find RoDTEP credit rates and All Industry Drawback rates for your HS chapter. Calculate estimated incentive on your FOB value.
          </p>
        </div>

        {/* Info banner */}
        <div className="mb-6 rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-700/40 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-saffron-600 dark:text-saffron-400 shrink-0 mt-0.5" />
          <div className="text-xs text-saffron-700 dark:text-saffron-300 leading-relaxed">
            <strong>RoDTEP</strong> (Remission of Duties and Taxes on Exported Products) credits are issued as scrips on the ICEGATE portal after eBRC filing. Rates were notified Aug 2021 and are subject to revision. Always verify the exact 8-digit HS code rate on the{" "}
            <a href="https://www.cbic.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">
              CBIC website
            </a>.
          </div>
        </div>

        {/* FOB Calculator input (sticky) */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Calculator className="h-5 w-5 text-saffron-500 shrink-0 hidden sm:block" />
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
              Your FOB value (₹)
            </label>
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
              <input
                type="number"
                value={fobValue}
                onChange={(e) => setFobValue(e.target.value)}
                placeholder="e.g. 5000000"
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              />
            </div>
            {fob > 0 && (
              <p className="text-xs text-zinc-400 sm:ml-2">
                Enter FOB value to see estimated credit for each category below.
              </p>
            )}
          </div>
        </div>

        {/* Search + Chapter filter */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, HS chapter, or keyword…"
              className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
            />
          </div>
          <select
            value={selectedChapter ?? ""}
            onChange={(e) => setSelectedChapter(e.target.value ? Number(e.target.value) : null)}
            className="h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 min-w-48"
          >
            <option value="">All chapters</option>
            {chapters.map((c) => (
              <option key={c.chapter} value={c.chapter}>
                Ch. {c.chapter} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-400 mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>

        {/* Results list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-400">
              No results found. Try a different keyword or chapter.
            </div>
          ) : (
            filtered.map((entry) => {
              const isExpanded = expanded === entry.id;
              const credit = fob > 0 ? calcCredit(entry) : null;
              const drawbackCredit = fob > 0 && entry.drawbackAIR
                ? fob * ((entry.drawbackAIR + (entry.drawbackAIRMax ?? entry.drawbackAIR)) / 2) / 100
                : null;

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {/* Chapter badge */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron-100 dark:bg-saffron-900/30">
                      <span className="text-xs font-bold text-saffron-700 dark:text-saffron-400">
                        {entry.chapter}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-zinc-400">Ch. {entry.chapter} · {entry.chapterTitle}</span>
                        {entry.hsCode && (
                          <span className="text-xs text-zinc-400">· HS {entry.hsCode}</span>
                        )}
                      </div>
                    </div>

                    {/* Rate badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-india-green-700 dark:text-india-green-400 bg-india-green-50 dark:bg-india-green-900/30 px-2.5 py-0.5 rounded-full">
                        RoDTEP {entry.rodtepMin}–{entry.rodtepMax}%
                      </span>
                      {entry.drawbackAIR && (
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                          DB {entry.drawbackAIR}{entry.drawbackAIRMax ? `–${entry.drawbackAIRMax}` : ""}%
                        </span>
                      )}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                  </button>

                  {/* Credit row (visible even when collapsed if FOB is set) */}
                  {credit !== null && !isExpanded && (
                    <div className="px-5 pb-3 flex items-center gap-6">
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="h-3.5 w-3.5 text-india-green-500" />
                        <span className="text-zinc-500">Est. RoDTEP credit:</span>
                        <span className="font-semibold text-india-green-700 dark:text-india-green-400">
                          {fmtCr(credit)}
                        </span>
                      </div>
                      {drawbackCredit !== null && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500">Drawback:</span>
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            {fmtCr(drawbackCredit)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 pb-5 pt-4 flex flex-col gap-4">
                      {/* Credit calculator */}
                      {fob > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-xl bg-india-green-50 dark:bg-india-green-900/20 border border-india-green-200 dark:border-india-green-800/40 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-india-green-600 dark:text-india-green-400 mb-1">RoDTEP Credit (est.)</p>
                            <p className="text-xl font-bold text-india-green-700 dark:text-india-green-300">{fmtCr(credit!)}</p>
                            <p className="text-xs text-india-green-600/70 dark:text-india-green-400/70 mt-1">
                              At avg {((entry.rodtepMin + entry.rodtepMax) / 2).toFixed(1)}% on FOB {fmtCr(fob)}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                              Range: {fmtCr(fob * entry.rodtepMin / 100)} – {fmtCr(fob * entry.rodtepMax / 100)}
                            </p>
                          </div>
                          {drawbackCredit !== null && (
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Duty Drawback (est.)</p>
                              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmtCr(drawbackCredit)}</p>
                              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                                At AIR {entry.drawbackAIR}{entry.drawbackAIRMax ? `–${entry.drawbackAIRMax}` : ""}% on FOB {fmtCr(fob)}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Total incentive ≈ {fmtCr((credit ?? 0) + drawbackCredit)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-xs text-zinc-400 text-center">
                          Enter your FOB value above to see estimated credit
                        </div>
                      )}

                      {/* Details grid */}
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">HS Code Range</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-100">{entry.hsCode ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Unit</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-100">{entry.unit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">RoDTEP Rate</p>
                          <p className="font-semibold text-india-green-700 dark:text-india-green-400">
                            {entry.rodtepMin}% – {entry.rodtepMax}% of FOB
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3">
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{entry.notes}</p>
                        </div>
                      )}

                      {/* How to claim */}
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">How to claim</p>
                        <ol className="flex flex-col gap-1">
                          {[
                            "File Shipping Bill on ICEGATE — mention correct ITC-HS code and select RoDTEP scheme",
                            "After vessel departure, EGM (Export General Manifest) is filed by shipping line",
                            "Post eBRC filing on DGFT portal (within 9 months), RoDTEP scrip is auto-credited to ICEGATE",
                            "Transfer or sell scrips on ICEGATE — use against customs duty payment or sell to importers",
                          ].map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-[10px] font-bold text-saffron-700 dark:text-saffron-400">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href="https://www.icegate.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          ICEGATE portal
                        </a>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <a
                          href="https://www.cbic.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          CBIC rate schedule
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Rates shown are indicative chapter-level ranges. Actual rates depend on the 8-digit ITC-HS code and are subject to revision by CBIC. Duty drawback AIR rates are separate from RoDTEP and cover refund of customs duty on inputs. Both can be claimed simultaneously on the same shipment.
          </p>
        </div>
      </div>
    </div>
  );
}
