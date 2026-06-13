"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle2,
  Minus,
} from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD", "JPY", "AUD"] as const;
type Currency = (typeof CURRENCIES)[number];

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SGD: "S$",
  JPY: "¥",
  AUD: "A$",
};

const FALLBACK: Record<Currency, number> = {
  USD: 83.5,
  EUR: 90.8,
  GBP: 106.0,
  AED: 22.7,
  SGD: 62.0,
  JPY: 0.56,
  AUD: 54.0,
};

const PAYMENT_TERMS = [
  { id: "advance", label: "TT Advance", days: 0, risk: "low" },
  { id: "lc_sight", label: "LC at Sight", days: 21, risk: "low" },
  { id: "da30", label: "DA 30 days", days: 30, risk: "medium" },
  { id: "da60", label: "DA 60 days", days: 60, risk: "medium" },
  { id: "da90", label: "DA 90 days", days: 90, risk: "high" },
  { id: "dp", label: "DP (Documents against Payment)", days: 14, risk: "medium" },
];

function fmtINR(val: number) {
  if (!isFinite(val)) return "—";
  if (Math.abs(val) >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (Math.abs(val) >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`;
  return "₹" + Math.round(val).toLocaleString("en-IN");
}

function fmtFcy(val: number, ccy: Currency) {
  const sym = SYMBOLS[ccy];
  if (Math.abs(val) >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(2)}M`;
  if (Math.abs(val) >= 1_000) return `${sym}${(val / 1_000).toFixed(0)}K`;
  return `${sym}${val.toFixed(2)}`;
}

export default function ForexHedgingPage() {
  const [ccy, setCcy] = useState<Currency>("USD");
  const [orderValue, setOrderValue] = useState("");
  const [spotRate, setSpotRate] = useState("");
  const [forwardRate, setForwardRate] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("da60");
  const [margin, setMargin] = useState("15");
  const [ratesLive, setRatesLive] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK);

  useEffect(() => {
    setRatesLoading(true);
    fetch("https://open.er-api.com/v6/latest/INR")
      .then((r) => r.json())
      .then((data: { rates?: Record<string, number> }) => {
        if (data.rates) {
          const r = data.rates;
          const live: Partial<Record<Currency, number>> = {};
          for (const cur of CURRENCIES) {
            live[cur] = r[cur] ? 1 / r[cur] : FALLBACK[cur];
          }
          setRates((prev) => ({ ...prev, ...live }));
          setRatesLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => {
    const live = rates[ccy];
    if (live) setSpotRate(live.toFixed(4));
  }, [ccy, rates]);

  const orderFcy = parseFloat(orderValue) || 0;
  const spot = parseFloat(spotRate) || FALLBACK[ccy];
  const fwd = parseFloat(forwardRate) || 0;
  const mg = (parseFloat(margin) || 0) / 100;
  const term = PAYMENT_TERMS.find((t) => t.id === paymentTerm)!;
  const hasData = orderFcy > 0;

  const calc = useMemo(() => {
    if (!orderFcy || !spot) return null;
    const inrToday = orderFcy * spot;
    const hedgePremiumPct = fwd > 0 ? ((fwd - spot) / spot) * 100 : null;
    const inrHedged = fwd > 0 ? orderFcy * fwd : null;
    const hedgeBenefit = inrHedged != null ? inrHedged - inrToday : null;
    const breakeven = inrToday * (1 - mg); // min INR you need to cover cost at your margin
    const breakevenRate = breakeven / orderFcy;

    const scenarios = [-15, -10, -5, -2, 0, 2, 5, 10, 15].map((pct) => {
      const rate = spot * (1 + pct / 100);
      const inr = orderFcy * rate;
      const diff = inr - inrToday;
      const pnl = inr - breakeven;
      return { pct, rate, inr, diff, pnl };
    });

    return { inrToday, hedgePremiumPct, inrHedged, hedgeBenefit, breakevenRate, scenarios, breakeven };
  }, [orderFcy, spot, fwd, mg]);

  const shouldHedge = calc && mg < 0.15 && orderFcy * spot > 2_500_000;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Forex Hedging Calculator
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Model your currency exposure, break-even rate, and P&amp;L impact of exchange rate movements. Decide whether to hedge.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Inputs */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Details</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Order currency</label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCcy(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        ccy === c
                          ? "bg-saffron-500 border-saffron-500 text-white"
                          : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Order value ({ccy})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">{SYMBOLS[ccy]}</span>
                    <input
                      type="number"
                      value={orderValue}
                      onChange={(e) => setOrderValue(e.target.value)}
                      placeholder="e.g. 50000"
                      className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Spot rate (₹ per 1 {ccy}){" "}
                    <span className={`font-normal text-[10px] ${ratesLive ? "text-india-green-500" : "text-zinc-400"}`}>
                      {ratesLoading ? "loading…" : ratesLive ? "· live" : "· fallback"}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">₹</span>
                    <input
                      type="number"
                      value={spotRate}
                      onChange={(e) => setSpotRate(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                    />
                    {ratesLoading && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 animate-spin" />}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Forward cover rate <span className="font-normal text-zinc-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">₹</span>
                    <input
                      type="number"
                      value={forwardRate}
                      onChange={(e) => setForwardRate(e.target.value)}
                      placeholder="Ask your bank"
                      className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Your profit margin (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Payment terms</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_TERMS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPaymentTerm(t.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                        paymentTerm === t.id
                          ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20"
                          : "border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      <span className={`font-medium ${paymentTerm === t.id ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {t.label}
                      </span>
                      <span className={`ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        t.risk === "low" ? "bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400"
                          : t.risk === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {t.risk}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hedge recommendation */}
            {hasData && calc && (
              <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                shouldHedge
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/40"
                  : "bg-india-green-50 dark:bg-india-green-900/20 border-india-green-300 dark:border-india-green-700/40"
              }`}>
                {shouldHedge
                  ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  : <CheckCircle2 className="h-5 w-5 text-india-green-500 shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`text-sm font-semibold ${shouldHedge ? "text-amber-700 dark:text-amber-300" : "text-india-green-700 dark:text-india-green-300"}`}>
                    {shouldHedge ? "Consider hedging this order" : "Hedging may be optional"}
                  </p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${shouldHedge ? "text-amber-600 dark:text-amber-400" : "text-india-green-600 dark:text-india-green-400"}`}>
                    {shouldHedge
                      ? `Your margin (${margin}%) is thin and exposure is large (${fmtINR(calc.inrToday)}). A 5% rate drop would erode ₹${fmtINR(orderFcy * spot * 0.05)} — talk to your bank about forward cover.`
                      : `With ${margin}% margin, you have reasonable buffer. Break-even rate is ₹${calc.breakevenRate.toFixed(2)}/${ccy}. Monitor rates and hedge if you see signs of rupee appreciation.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {!hasData ? (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 flex flex-col items-center justify-center text-center">
                <TrendingDown className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400">Enter order value to see your forex exposure and hedging analysis.</p>
              </div>
            ) : calc && (
              <>
                {/* Key metrics */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Exposure Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      label="INR exposure today"
                      value={fmtINR(calc.inrToday)}
                      sub={`${fmtFcy(orderFcy, ccy)} × ₹${spot.toFixed(2)}`}
                      accent
                    />
                    <MetricCard
                      label="Break-even rate"
                      value={`₹${calc.breakevenRate.toFixed(2)}`}
                      sub={`Rate at which margin = 0 (${margin}% margin)`}
                    />
                    {fwd > 0 && calc.inrHedged != null && (
                      <>
                        <MetricCard
                          label="Hedged INR amount"
                          value={fmtINR(calc.inrHedged)}
                          sub={`At forward ₹${fwd.toFixed(2)}`}
                        />
                        <MetricCard
                          label={calc.hedgeBenefit! >= 0 ? "Hedge benefit" : "Hedge cost"}
                          value={fmtINR(Math.abs(calc.hedgeBenefit!))}
                          sub={`vs. spot rate today`}
                          positive={calc.hedgeBenefit! >= 0}
                          negative={calc.hedgeBenefit! < 0}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Scenario table */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rate Scenario Analysis</p>
                    <p className="text-xs text-zinc-400 mt-0.5">What happens to your INR receipts if the rate moves?</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Scenario</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500">Rate (₹)</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500">INR Received</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500">vs Today</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-500">P&L vs Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calc.scenarios.map((s) => {
                          const isBase = s.pct === 0;
                          return (
                            <tr key={s.pct} className={`border-b border-zinc-50 dark:border-zinc-800/50 ${isBase ? "bg-zinc-50 dark:bg-zinc-800/30" : ""}`}>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  {s.pct < 0 ? (
                                    <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                  ) : s.pct > 0 ? (
                                    <TrendingUp className="h-3.5 w-3.5 text-india-green-500 shrink-0" />
                                  ) : (
                                    <Minus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  )}
                                  <span className={`text-xs font-medium ${
                                    s.pct < 0 ? "text-red-600 dark:text-red-400"
                                      : s.pct > 0 ? "text-india-green-700 dark:text-india-green-400"
                                      : "text-zinc-600 dark:text-zinc-400"
                                  }`}>
                                    {s.pct === 0 ? "No change" : `${s.pct > 0 ? "+" : ""}${s.pct}%`}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300 text-xs font-medium">{s.rate.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-zinc-800 dark:text-zinc-100 text-xs font-semibold">{fmtINR(s.inr)}</td>
                              <td className={`px-4 py-2.5 text-right tabular-nums text-xs font-semibold ${
                                s.diff < 0 ? "text-red-600 dark:text-red-400"
                                  : s.diff > 0 ? "text-india-green-600 dark:text-india-green-400"
                                  : "text-zinc-400"
                              }`}>
                                {s.diff === 0 ? "—" : `${s.diff > 0 ? "+" : ""}${fmtINR(s.diff)}`}
                              </td>
                              <td className={`px-4 py-2.5 text-right tabular-nums text-xs font-semibold ${
                                s.pnl < 0 ? "text-red-600 dark:text-red-400" : "text-india-green-600 dark:text-india-green-400"
                              }`}>
                                {s.pnl < 0 ? `LOSS ${fmtINR(Math.abs(s.pnl))}` : `OK`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hedging tips */}
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 flex items-start gap-3">
                  <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed flex flex-col gap-1">
                    <p><strong className="text-zinc-700 dark:text-zinc-300">Forward cover:</strong> Lock in today's rate for payment expected in 30–90 days. Available at any authorized bank. Typically costs 0.5–2% annually (premium/discount).</p>
                    <p><strong className="text-zinc-700 dark:text-zinc-300">When to hedge:</strong> Order value &gt; ₹25L, payment terms &gt; 30 days, and your margin is thin (&lt;15%).</p>
                    <p><strong className="text-zinc-700 dark:text-zinc-300">FEMA rule:</strong> Forward cover on export receivables is permitted under FEMA. You can cover up to the full invoice amount.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent, positive, negative }: {
  label: string; value: string; sub?: string;
  accent?: boolean; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${
      accent ? "bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-700/40"
        : "bg-zinc-50 dark:bg-zinc-800/50"
    }`}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${
        accent ? "text-saffron-700 dark:text-saffron-300"
          : positive ? "text-india-green-700 dark:text-india-green-400"
          : negative ? "text-red-600 dark:text-red-400"
          : "text-zinc-900 dark:text-zinc-50"
      }`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}
