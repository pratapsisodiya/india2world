"use client";

import { useState } from "react";
import {
  Search, Globe2, Mail, Phone, ExternalLink, Building2,
  Loader2, AlertCircle, Sparkles, ChevronDown, ChevronUp, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

const BACKEND_URL = "";

const POPULAR_PRODUCTS = [
  "Basmati rice", "Handloom cotton fabric", "Turmeric powder", "Black pepper",
  "Silver jewellery", "Leather handbags", "Engineering castings", "Pharma APIs",
  "Organic spices", "Ready-made garments",
];

const POPULAR_COUNTRIES = [
  "UAE", "USA", "UK", "Germany", "Australia",
  "Canada", "Singapore", "Japan", "France", "Netherlands",
];

interface Buyer {
  companyName: string;
  country: string;
  type: string;
  website?: string;
  email?: string;
  phone?: string;
  productCategories: string[];
  annualImportVolume?: string;
  notes: string;
  sourceUrl?: string;
}

interface BuyerFinderResponse {
  marketAnalysis?: string[];
  buyers: Buyer[];
  searchSummary: string;
  outreachTips: string[];
  verificationNote: string;
}

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Building2 className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{buyer.companyName}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500">{buyer.country}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <Badge variant="default">{buyer.type}</Badge>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400 mt-1" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 mt-1" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800 space-y-3">
          {buyer.notes && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{buyer.notes}</p>
          )}

          {buyer.productCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {buyer.productCategories.map((cat) => (
                <Badge key={cat} variant="orange">{cat}</Badge>
              ))}
            </div>
          )}

          {buyer.annualImportVolume && (
            <p className="text-xs text-zinc-500">Import volume: <span className="font-medium text-zinc-700 dark:text-zinc-300">{buyer.annualImportVolume}</span></p>
          )}

          <div className="flex flex-wrap gap-2">
            {buyer.website && (
              <a
                href={buyer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Globe2 className="h-3 w-3" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {buyer.email && (
              <button
                type="button"
                onClick={() => copy(buyer.email!, "email")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Mail className="h-3 w-3" />
                {copied === "email" ? "Copied!" : buyer.email}
                {copied === "email" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
            {buyer.phone && (
              <button
                type="button"
                onClick={() => copy(buyer.phone!, "phone")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Phone className="h-3 w-3" />
                {copied === "phone" ? "Copied!" : buyer.phone}
                {copied === "phone" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
            {buyer.sourceUrl && (
              <a
                href={buyer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuyerFinderPage() {
  const [product, setProduct] = useState("");
  const [country, setCountry] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuyerFinderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const p = product.trim();
    const c = country.trim();
    if (!p || !c) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/buyers/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: p, targetCountry: c, hsCode: hsCode.trim() || undefined }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Error ${resp.status}`);
      }
      setResult(await resp.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-saffron-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">AI-Powered</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Buyer Finder
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Find real importers, distributors, and buyers for your product in any target market.
          </p>
        </div>

        {/* Search form */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Your product
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. handmade silk sarees, organic turmeric powder"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_PRODUCTS.slice(0, 5).map((p) => (
                  <button key={p} type="button" onClick={() => setProduct(p)}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 hover:bg-saffron-100 hover:text-saffron-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-saffron-500/15 dark:hover:text-saffron-400">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Target country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. UAE, USA, UK"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_COUNTRIES.slice(0, 5).map((c) => (
                  <button key={c} type="button" onClick={() => setCountry(c)}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 hover:bg-saffron-100 hover:text-saffron-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-saffron-500/15 dark:hover:text-saffron-400">
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                HS Code <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="e.g. 5208, 0904"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !product.trim() || !country.trim()}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-saffron-500 text-sm font-semibold text-white transition-colors hover:bg-saffron-600 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Searching…" : "Find Buyers"}
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.searchSummary}</p>
            </div>

            {/* Analysis Steps */}
            {result.marketAnalysis && result.marketAnalysis.length > 0 && (
              <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Market Analysis</h3>
                <ul className="space-y-1.5">
                  {result.marketAnalysis.map((step, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">• {step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buyers */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {result.buyers.length} potential buyer{result.buyers.length !== 1 ? "s" : ""} found
              </h2>
              <div className="space-y-2">
                {result.buyers.map((b) => <BuyerCard key={b.companyName} buyer={b} />)}
              </div>
            </div>

            {/* Outreach tips */}
            {result.outreachTips.length > 0 && (
              <div className="rounded-xl bg-saffron-50 p-4 ring-1 ring-saffron-200 dark:bg-saffron-500/10 dark:ring-saffron-500/20">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron-700 dark:text-saffron-400">Outreach Tips</h3>
                <ul className="space-y-1.5">
                  {result.outreachTips.map((tip) => (
                    <li key={tip} className="text-sm text-saffron-800 dark:text-saffron-300">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-zinc-400">{result.verificationNote}</p>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="py-12 text-center text-zinc-400">
            <Search className="mx-auto mb-3 h-8 w-8 opacity-30" />
            <p className="text-sm">Enter your product and target country to find real buyers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
