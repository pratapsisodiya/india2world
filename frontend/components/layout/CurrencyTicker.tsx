"use client";

import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";

// Static baseline rates — realistic but not live
const BASE_RATES: { pair: string; rate: number; label: string }[] = [
  { pair: "USD/INR", rate: 83.42, label: "₹" },
  { pair: "EUR/INR", rate: 90.18, label: "₹" },
  { pair: "GBP/INR", rate: 105.74, label: "₹" },
  { pair: "AED/INR", rate: 22.71, label: "₹" },
  { pair: "SGD/INR", rate: 61.84, label: "₹" },
  { pair: "JPY/INR", rate: 0.537, label: "₹" },
  { pair: "AUD/INR", rate: 54.12, label: "₹" },
  { pair: "CNY/INR", rate: 11.52, label: "₹" },
];

// Add tiny random noise (±0.08%) for "live" feel — resets each session
function addNoise(rate: number): number {
  const jitter = (Math.random() - 0.5) * 0.0016 * rate;
  return parseFloat((rate + jitter).toFixed(rate < 1 ? 3 : 2));
}

interface RateItem {
  pair: string;
  rate: number;
  label: string;
  change: "up" | "down" | "flat";
}

function initRates(): RateItem[] {
  return BASE_RATES.map((r) => ({
    ...r,
    rate: addNoise(r.rate),
    change: "flat",
  }));
}

export function CurrencyTicker() {
  const [rates, setRates] = useState<RateItem[]>(initRates);
  const [refreshed, setRefreshed] = useState<string>("");

  // Simulate subtle rate flicker every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setRates((prev) =>
        prev.map((r) => {
          const newRate = addNoise(r.rate);
          const diff = newRate - r.rate;
          return {
            ...r,
            rate: newRate,
            change: diff > 0.01 ? "up" : diff < -0.01 ? "down" : "flat",
          };
        })
      );
      setRefreshed(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/60">
      <div className="flex items-center">
        {/* Static left label */}
        <div className="flex shrink-0 items-center gap-1.5 border-r border-zinc-200 bg-saffron-500/10 px-3 py-1.5 dark:border-zinc-800 dark:bg-saffron-500/5">
          <TrendingUp className="h-3 w-3 text-saffron-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-600 dark:text-saffron-400 whitespace-nowrap">
            FX Rates
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-ticker gap-0 whitespace-nowrap">
            {[...rates, ...rates].map((r, i) => (
              <span
                key={`${r.pair}-${i}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium"
              >
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                  {r.pair}
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">
                  {r.label}{r.rate.toFixed(r.rate < 1 ? 3 : 2)}
                </span>
                {r.change === "up" && (
                  <span className="text-india-green-500 text-[9px] font-bold">▲</span>
                )}
                {r.change === "down" && (
                  <span className="text-red-500 text-[9px] font-bold">▼</span>
                )}
                <span className="text-zinc-200 dark:text-zinc-800 mx-1">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: refresh time */}
        {refreshed && (
          <div className="flex shrink-0 items-center gap-1 border-l border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
            <RefreshCw className="h-2.5 w-2.5 text-zinc-400" />
            <span className="text-[9px] text-zinc-400">{refreshed}</span>
          </div>
        )}
      </div>
    </div>
  );
}
