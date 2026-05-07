"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
];

const QUICK_PAIRS = [
  { from: "INR", to: "USD", label: "INR → USD" },
  { from: "INR", to: "AED", label: "INR → AED" },
  { from: "INR", to: "EUR", label: "INR → EUR" },
  { from: "USD", to: "INR", label: "USD → INR" },
  { from: "GBP", to: "INR", label: "GBP → INR" },
];

function fmt(val: number, decimals = 4) {
  if (!isFinite(val)) return "—";
  return val.toLocaleString("en-US", { minimumFractionDigits: decimals > 2 ? 2 : decimals, maximumFractionDigits: decimals });
}

export default function CurrencyPage() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("https://open.er-api.com/v6/latest/INR");
      const data = await resp.json() as { rates?: Record<string, number>; time_last_update_utc?: string };
      if (!data.rates) throw new Error("No rates in response");
      setRates(data.rates);
      setUpdatedAt(data.time_last_update_utc ? new Date(data.time_last_update_utc) : new Date());
    } catch {
      setError("Could not fetch live rates. Showing indicative rates.");
      setRates({ USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, SGD: 0.016, JPY: 1.77, AUD: 0.018, CAD: 0.016, CNY: 0.086, CHF: 0.011, SAR: 0.044, INR: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  function getRate(fromCode: string, toCode: string): number {
    if (!rates) return 0;
    if (fromCode === "INR") return rates[toCode] ?? 0;
    const fromInInr = 1 / (rates[fromCode] ?? 1);
    return fromInInr * (rates[toCode] ?? 1);
  }

  const converted = (() => {
    const amt = parseFloat(amount) || 0;
    const rate = getRate(from, to);
    return amt * rate;
  })();

  const fromCur = CURRENCIES.find((c) => c.code === from);
  const toCur = CURRENCIES.find((c) => c.code === to);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Currency Converter
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-zinc-500">Live exchange rates for export pricing and invoicing.</p>
            {updatedAt && !loading && (
              <span className="rounded-full bg-india-green-100 px-2 py-0.5 text-[10px] font-semibold text-india-green-700 dark:bg-india-green-500/15 dark:text-india-green-400">
                LIVE
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>
          </div>
        )}

        {/* Main converter */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 mb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-xl font-bold text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => { setFrom(to); setTo(from); }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-saffron-50 hover:text-saffron-600 hover:border-saffron-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-saffron-500/10 transition-colors self-end"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-saffron-50 p-5 dark:bg-saffron-500/10">
            {loading ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Fetching live rates…</span>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-saffron-700 dark:text-saffron-300 tabular-nums">
                  {toCur?.flag} {fmt(converted, 2)} {to}
                </p>
                <p className="mt-1 text-sm text-saffron-600 dark:text-saffron-400">
                  {fromCur?.flag} 1 {from} = {fmt(getRate(from, to), 4)} {to}
                </p>
                {updatedAt && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Rates updated {updatedAt.toLocaleString()}
                    {" · "}
                    <button onClick={fetchRates} className="underline hover:text-saffron-600">Refresh</button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick pairs */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick conversions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PAIRS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setFrom(p.from); setTo(p.to); }}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-saffron-50 hover:ring-saffron-300 hover:text-saffron-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-saffron-500/10 dark:hover:text-saffron-400 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate table — all vs INR */}
        {rates && !loading && (
          <div className="rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
              <TrendingUp className="h-4 w-4 text-saffron-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">All rates vs ₹ INR</h2>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {CURRENCIES.filter((c) => c.code !== "INR").map((c) => {
                const inInr = 1 / (rates[c.code] ?? 1);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setFrom("INR"); setTo(c.code); }}
                    className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.code}</p>
                        <p className="text-xs text-zinc-500">{c.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">₹{fmt(inInr, 2)}</p>
                      <p className="text-xs text-zinc-400 tabular-nums">1 {c.code} = ₹{fmt(inInr, 2)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-zinc-400">
          Rates from ExchangeRate-API · For actual transactions always use your bank&apos;s TT rate
        </p>
      </div>
    </div>
  );
}
