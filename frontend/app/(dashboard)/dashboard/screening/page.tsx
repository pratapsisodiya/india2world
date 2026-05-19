"use client";

import { useState } from "react";
import { ShieldAlert, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type EntityType = "company" | "individual" | "vessel" | "unknown";

interface ScreeningResponse {
  status: "clear" | "warning" | "blocked";
  riskScore: number;
  matchedLists: string[];
  reasoning: string;
  countryStatus: string;
  recommendation: string;
}

export default function RestrictedPartyScreeningPage() {
  const [entityName, setEntityName] = useState("");
  const [country, setCountry] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreeningResponse | null>(null);

  async function handleScreen(e: React.FormEvent) {
    e.preventDefault();
    if (!entityName.trim() || !country.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(`${BACKEND_URL}/api/compliance/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityName, country, entityType }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Server error ${resp.status}`);
      }

      setResult(await resp.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to screen entity.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusConfig(status: "clear" | "warning" | "blocked") {
    switch (status) {
      case "clear":
        return { icon: CheckCircle, color: "text-india-green-500", bg: "bg-india-green-50 dark:bg-india-green-900/20", border: "border-india-green-200 dark:border-india-green-800" };
      case "warning":
        return { icon: AlertTriangle, color: "text-saffron-500", bg: "bg-saffron-50 dark:bg-saffron-900/20", border: "border-saffron-200 dark:border-saffron-800" };
      case "blocked":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" };
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-6 w-6 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Restricted Party Screening (RPS)
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Automatically check your buyers, suppliers, and partners against global OFAC, UN, and BIS sanctions lists.
            AI-powered semantic matching identifies aliases and comprehensive embargoes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_400px]">
          {/* Screening Form */}
          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <form onSubmit={handleScreen} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Entity Name
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:border-zinc-700 dark:text-zinc-50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United Arab Emirates"
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:border-zinc-700 dark:text-zinc-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Entity Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as EntityType)}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2.5 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:border-zinc-700 dark:text-zinc-50"
                >
                  <option value="company">Company / Organization</option>
                  <option value="individual">Individual Person</option>
                  <option value="vessel">Vessel / Ship</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !entityName.trim() || !country.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-saffron-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Screening databases...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Run Screening
                  </>
                )}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                {error}
              </div>
            )}
          </div>

          {/* Results Area */}
          <div>
            {!result && !loading && (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                <ShieldAlert className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Ready to screen
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter an entity name and country to check against international watchlists.
                </p>
              </div>
            )}

            {result && (
              <div className={cn("rounded-2xl border p-6 flex flex-col h-full", getStatusConfig(result.status).bg, getStatusConfig(result.status).border)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const StatusIcon = getStatusConfig(result.status).icon;
                      return <StatusIcon className={cn("h-8 w-8", getStatusConfig(result.status).color)} />;
                    })()}
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 capitalize">
                        {result.status}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Risk Score: <span className={cn("font-bold", getStatusConfig(result.status).color)}>{result.riskScore}/100</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Matched Lists
                    </h4>
                    {result.matchedLists.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.matchedLists.map((list, i) => (
                          <span key={i} className="inline-flex rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-500/20 dark:text-red-400">
                            {list}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">No watchlists matched.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Country Assessment
                    </h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-white/20">
                      {result.countryStatus}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Analyst Reasoning
                    </h4>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {result.reasoning}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Recommended Action
                  </h4>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
