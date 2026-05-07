"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  Plane,
  Ship,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
} from "lucide-react";

const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 91.0,
  AED: 22.7,
  GBP: 106.0,
  SGD: 62.0,
};

const INCOTERMS = [
  {
    term: "EXW — Ex Works",
    seller: "Goods ready at factory/warehouse",
    buyer: "All costs from factory to destination",
    risk: "Transfers at factory gate",
  },
  {
    term: "FOB — Free On Board",
    seller: "Inland freight + export clearance + loaded on vessel",
    buyer: "Ocean freight + insurance + import duties",
    risk: "Transfers when goods cross ship's rail at port of loading",
  },
  {
    term: "CFR — Cost and Freight",
    seller: "FOB + ocean freight to destination port",
    buyer: "Insurance + import duties + inland delivery",
    risk: "Transfers when goods cross ship's rail at port of loading",
  },
  {
    term: "CIF — Cost, Insurance & Freight",
    seller: "CFR + marine insurance",
    buyer: "Import duties + inland delivery",
    risk: "Transfers when goods cross ship's rail at port of loading",
  },
  {
    term: "DDP — Delivered Duty Paid",
    seller: "Everything including import duties and delivery",
    buyer: "Nothing — goods delivered to their door",
    risk: "Transfers at buyer's premises",
  },
];

function fmt(val: number, currency: string, rates: Record<string, number>) {
  if (!isFinite(val)) return "—";
  if (currency === "INR") {
    return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  const converted = val / rate;
  const sym = { USD: "$", EUR: "€", AED: "AED ", GBP: "£", SGD: "S$" }[currency] ?? "";
  return sym + converted.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function PricingPage() {
  const [exworks, setExworks] = useState("");
  const [qty, setQty] = useState("");
  const [inland, setInland] = useState("");
  const [exportCharges, setExportCharges] = useState("");
  const [freightType, setFreightType] = useState<"sea" | "air">("sea");
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("0.5");
  const [margin, setMargin] = useState("20");
  const [currency, setCurrency] = useState("USD");
  const [showIncoterms, setShowIncoterms] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    setRatesLoading(true);
    fetch("https://open.er-api.com/v6/latest/INR")
      .then((r) => r.json())
      .then((data: { rates?: Record<string, number> }) => {
        if (data.rates) {
          const r = data.rates;
          setRates({
            INR: 1,
            USD: r["USD"] ? 1 / r["USD"] : FALLBACK_RATES.USD,
            EUR: r["EUR"] ? 1 / r["EUR"] : FALLBACK_RATES.EUR,
            AED: r["AED"] ? 1 / r["AED"] : FALLBACK_RATES.AED,
            GBP: r["GBP"] ? 1 / r["GBP"] : FALLBACK_RATES.GBP,
            SGD: r["SGD"] ? 1 / r["SGD"] : FALLBACK_RATES.SGD,
          });
          setRatesLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  const calc = useMemo(() => {
    const ew = parseFloat(exworks) || 0;
    const q = Math.max(parseFloat(qty) || 1, 0.0001);
    const il = parseFloat(inland) || 0;
    const ec = parseFloat(exportCharges) || 0;
    const fr = parseFloat(freight) || 0;
    const ins = Math.min(parseFloat(insurance) || 0, 99);
    const mg = Math.min(parseFloat(margin) || 0, 99.9);

    const ewTotal = ew * q;
    const fob = ewTotal + il + ec;
    const cfr = fob + fr;
    const cif = ins > 0 ? cfr / (1 - ins / 100) : cfr;
    const selling = mg < 100 ? cif / (1 - mg / 100) : cif * 2;

    return { ewTotal, fob, cfr, cif, selling, qty: q };
  }, [exworks, qty, inland, exportCharges, freight, insurance, margin]);

  const hasData = (parseFloat(exworks) || 0) > 0;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Export Pricing Calculator
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Calculate FOB, CIF, and suggested selling price for your export shipment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Inputs */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Shipment Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Ex-works price / unit (₹)" hint="Your factory gate price per unit">
                <NumberInput value={exworks} onChange={setExworks} placeholder="e.g. 500" prefix="₹" />
              </Field>
              <Field label="Quantity (units)">
                <NumberInput value={qty} onChange={setQty} placeholder="e.g. 1000" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Inland freight + handling (₹)" hint="Total cost to get goods to port">
                <NumberInput value={inland} onChange={setInland} placeholder="e.g. 15000" prefix="₹" />
              </Field>
              <Field label="Export charges (₹)" hint="CHA, port handling, stuffing">
                <NumberInput value={exportCharges} onChange={setExportCharges} placeholder="e.g. 8000" prefix="₹" />
              </Field>
            </div>

            {/* Freight type */}
            <Field label="Freight type">
              <div className="flex gap-2">
                {(["sea", "air"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFreightType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      freightType === type
                        ? "bg-saffron-500 border-saffron-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300 dark:hover:border-saffron-600"
                    }`}
                  >
                    {type === "sea" ? <Ship className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
                    {type === "sea" ? "Sea freight" : "Air freight"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`${freightType === "sea" ? "Ocean" : "Air"} freight total (₹)`} hint="Total freight cost for this shipment">
              <NumberInput value={freight} onChange={setFreight} placeholder="e.g. 45000" prefix="₹" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Insurance rate (%)" hint="Typically 0.3–0.5% of CIF value">
                <NumberInput value={insurance} onChange={setInsurance} placeholder="0.5" suffix="%" />
              </Field>
              <Field label="Target margin (%)" hint="Your profit margin on selling price">
                <NumberInput value={margin} onChange={setMargin} placeholder="20" suffix="%" />
              </Field>
            </div>

            {/* Currency */}
            <Field label="Display currency">
              <div className="flex flex-wrap gap-2">
                {Object.keys(FALLBACK_RATES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      currency === c
                        ? "bg-saffron-500 border-saffron-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {currency !== "INR" && (
                <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                  {ratesLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Info className="h-3 w-3" />}
                  {ratesLive ? "Live rate" : "Fallback rate"}: 1 {currency} = ₹{rates[currency]?.toFixed(2)}
                  {ratesLive && <span className="text-india-green-500 font-medium">· live</span>}
                </p>
              )}
            </Field>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Price Breakdown
              </h2>

              {!hasData ? (
                <div className="py-10 text-center">
                  <DollarSign className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Enter ex-works price to see results</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <PriceRow
                    label="EXW Total"
                    sublabel="Factory gate value"
                    inr={calc.ewTotal}
                    perUnit={calc.ewTotal / calc.qty}
                    currency={currency}
                    rates={rates}
                    muted
                  />
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                  <PriceRow
                    label="FOB"
                    sublabel="Free On Board — at Indian port"
                    inr={calc.fob}
                    perUnit={calc.fob / calc.qty}
                    currency={currency}
                    rates={rates}
                  />
                  <PriceRow
                    label="CFR"
                    sublabel="Cost & Freight — at destination port"
                    inr={calc.cfr}
                    perUnit={calc.cfr / calc.qty}
                    currency={currency}
                    rates={rates}
                  />
                  <PriceRow
                    label="CIF"
                    sublabel="Cost, Insurance & Freight"
                    inr={calc.cif}
                    perUnit={calc.cif / calc.qty}
                    currency={currency}
                    rates={rates}
                  />
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                  <PriceRow
                    label="Suggested Selling Price"
                    sublabel={`At ${margin}% margin on CIF`}
                    inr={calc.selling}
                    perUnit={calc.selling / calc.qty}
                    currency={currency}
                    rates={rates}
                    highlight
                  />
                </div>
              )}
            </div>

            {hasData && (
              <div className="rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800/40 p-4">
                <p className="text-xs text-saffron-700 dark:text-saffron-300 leading-relaxed">
                  <strong>Note:</strong> This is an indicative estimate. Actual costs may vary based on
                  port charges, exchange rates, duty drawback, RoDTEP credits, and negotiated freight rates.
                  Consult your CHA for a precise shipment quote.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Incoterms reference */}
        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowIncoterms((p) => !p)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Incoterms Quick Reference
            </span>
            {showIncoterms ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </button>

          {showIncoterms && (
            <div className="px-6 pb-6">
              <div className="grid gap-3">
                {INCOTERMS.map((it) => (
                  <div
                    key={it.term}
                    className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {it.term}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <div>
                        <span className="block font-medium text-zinc-700 dark:text-zinc-300 mb-0.5">Seller covers</span>
                        {it.seller}
                      </div>
                      <div>
                        <span className="block font-medium text-zinc-700 dark:text-zinc-300 mb-0.5">Buyer covers</span>
                        {it.buyer}
                      </div>
                      <div>
                        <span className="block font-medium text-zinc-700 dark:text-zinc-300 mb-0.5">Risk transfer</span>
                        {it.risk}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
        {hint && <span className="ml-1 font-normal text-zinc-400">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-zinc-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}`}
      />
      {suffix && (
        <span className="absolute right-3 text-sm text-zinc-400 pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function PriceRow({
  label,
  sublabel,
  inr,
  perUnit,
  currency,
  rates,
  highlight,
  muted,
}: {
  label: string;
  sublabel: string;
  inr: number;
  perUnit: number;
  currency: string;
  rates: Record<string, number>;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg ${
        highlight
          ? "bg-saffron-50 dark:bg-saffron-900/20 ring-1 ring-saffron-200 dark:ring-saffron-800/40"
          : muted
          ? "opacity-70"
          : ""
      }`}
    >
      <div className="min-w-0">
        <p
          className={`text-sm font-semibold ${
            highlight
              ? "text-saffron-700 dark:text-saffron-300"
              : "text-zinc-800 dark:text-zinc-200"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{sublabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold tabular-nums ${
            highlight ? "text-saffron-600 dark:text-saffron-400" : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {currency === "INR" ? fmt(inr, "INR", rates) : fmt(inr, currency, rates)}
        </p>
        <p className="text-xs text-zinc-400 tabular-nums">
          {currency === "INR"
            ? `₹${perUnit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/unit`
            : `${fmt(perUnit, currency, rates)}/unit`}
        </p>
      </div>
    </div>
  );
}
