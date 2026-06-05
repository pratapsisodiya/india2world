"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Scale, Loader2, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";

const BACKEND = "";

const SECTORS = [
  "Textiles & Apparel",
  "Handicrafts",
  "Spices & Agricultural Products",
  "Gems & Jewellery",
  "Engineering Goods",
  "Pharmaceuticals",
  "IT / ITES Services",
  "Leather & Footwear",
];

const COUNTRIES = [
  { name: "United States", flag: "🇺🇸" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "China", flag: "🇨🇳" },
  { name: "France", flag: "🇫🇷" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Nepal", flag: "🇳🇵" },
];

type State = "idle" | "loading" | "done" | "error";

export default function ComparePage() {
  const [sector, setSector] = useState("");
  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");
  const [state, setState] = useState<State>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const availableB = COUNTRIES.filter((c) => c.name !== countryA);
  const canCompare = sector && countryA && countryB && countryA !== countryB;

  const handleCompare = useCallback(async () => {
    if (!canCompare) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("loading");
    setOutput("");
    setError("");

    const prompt = `I am an Indian exporter of ${sector}. Please give me a detailed side-by-side comparison of exporting to **${countryA}** versus **${countryB}** from India.

Cover the following for each country:
1. **FTA / Trade Agreement Status** with India — and what duty benefit it gives for ${sector}
2. **Key Import Tariffs** (MFN rate and FTA rate if applicable)
3. **Required Certifications & Regulations** specific to ${sector}
4. **Market Size & Demand** for Indian ${sector}
5. **Typical Payment Terms** used by buyers in this market
6. **Top Challenges** for Indian exporters of ${sector}
7. **Key Advantages** of this market for ${sector}

Then give a clear **Recommendation** — which market should I prioritise first and why, given I am an Indian ${sector} exporter.

Please use markdown tables and clear headers. Be specific and practical.`;

    try {
      const resp = await fetch(`${BACKEND}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          provider: "openai",
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data:")) continue;
          try {
            const json = JSON.parse(part.slice(5).trim());
            if (json.type === "text") {
              accumulated += json.text;
              setOutput(accumulated);
            } else if (json.type === "done") {
              setState("done");
            } else if (json.type === "error") {
              throw new Error(json.message ?? "Stream error");
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      if (accumulated) setState("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }, [canCompare, sector, countryA, countryB]);

  function handleReset() {
    abortRef.current?.abort();
    setState("idle");
    setOutput("");
    setError("");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Market Comparison
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            AI-powered side-by-side comparison of two export markets for your sector.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Sector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your export sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              >
                <option value="">Select sector...</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Country A */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Market A
              </label>
              <select
                value={countryA}
                onChange={(e) => {
                  setCountryA(e.target.value);
                  if (e.target.value === countryB) setCountryB("");
                }}
                className="h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              >
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Country B */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Market B
              </label>
              <select
                value={countryB}
                onChange={(e) => setCountryB(e.target.value)}
                disabled={!countryA}
                className="h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select country...</option>
                {availableB.map((c) => (
                  <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleCompare}
              disabled={!canCompare || state === "loading"}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  Compare Markets
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {(state === "done" || state === "error") && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Compare again
              </button>
            )}
          </div>
        </div>

        {/* Output */}
        {state === "error" && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Comparison failed</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-1">Make sure the backend is running at {BACKEND}</p>
            </div>
          </div>
        )}

        {(state === "loading" || state === "done") && output && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
            {/* Comparison header */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {COUNTRIES.find((c) => c.name === countryA)?.flag}
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{countryA}</span>
              </div>
              <Scale className="h-4 w-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {COUNTRIES.find((c) => c.name === countryB)?.flag}
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{countryB}</span>
              </div>
              <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                {sector}
              </span>
              {state === "loading" && (
                <Loader2 className="h-4 w-4 animate-spin text-saffron-500 shrink-0" />
              )}
            </div>

            <div className="prose prose-sm dark:prose-invert prose-india max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-table:text-xs prose-th:bg-zinc-50 dark:prose-th:bg-zinc-800 prose-td:py-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            </div>
          </div>
        )}

        {state === "idle" && (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 py-16 flex flex-col items-center justify-center text-center gap-3">
            <Scale className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Select your sector and two markets above to generate an AI comparison
            </p>
            <p className="text-xs text-zinc-400">
              The comparison covers FTA benefits, tariffs, regulations, demand, and payment terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
