"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Ship,
  Plane,
  Info,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 91.0,
  AED: 22.7,
  GBP: 106.0,
  SGD: 62.0,
  JPY: 0.56,
  AUD: 54.0,
};

const DESTINATION_DUTIES: Record<string, { duty: number; vat: number; label: string }> = {
  US: { duty: 3.5, vat: 0, label: "United States" },
  EU: { duty: 4.0, vat: 20, label: "European Union" },
  UK: { duty: 4.0, vat: 20, label: "United Kingdom" },
  UAE: { duty: 5.0, vat: 5, label: "UAE" },
  SG: { duty: 0, vat: 9, label: "Singapore" },
  JP: { duty: 3.2, vat: 10, label: "Japan" },
  AU: { duty: 5.0, vat: 10, label: "Australia" },
  CA: { duty: 3.5, vat: 13, label: "Canada" },
  SA: { duty: 5.0, vat: 15, label: "Saudi Arabia" },
  ZA: { duty: 10, vat: 15, label: "South Africa" },
};

function fmt(val: number, currency: string, rates: Record<string, number>) {
  if (!isFinite(val)) return "—";
  if (currency === "INR") {
    return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  const converted = val / rate;
  const sym: Record<string, string> = {
    USD: "$", EUR: "€", AED: "AED ", GBP: "£", SGD: "S$", JPY: "¥", AUD: "A$",
  };
  return (sym[currency] ?? "") + converted.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function LandedCostPage() {
  const [cifValue, setCifValue] = useState("");
  const [qty, setQty] = useState("");
  const [destKey, setDestKey] = useState("US");
  const [dutyRate, setDutyRate] = useState("3.5");
  const [vatRate, setVatRate] = useState("0");
  const [agentFee, setAgentFee] = useState("");
  const [portHandling, setPortHandling] = useState("");
  const [lastMile, setLastMile] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const preset = DESTINATION_DUTIES[destKey];
    if (preset) {
      setDutyRate(String(preset.duty));
      setVatRate(String(preset.vat));
    }
  }, [destKey]);

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
            JPY: r["JPY"] ? 1 / r["JPY"] : FALLBACK_RATES.JPY,
            AUD: r["AUD"] ? 1 / r["AUD"] : FALLBACK_RATES.AUD,
          });
          setRatesLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  const calc = useMemo(() => {
    const cif = parseFloat(cifValue) || 0;
    const q = Math.max(parseFloat(qty) || 1, 0.001);
    const duty = (parseFloat(dutyRate) || 0) / 100;
    const vat = (parseFloat(vatRate) || 0) / 100;
    const agent = parseFloat(agentFee) || 0;
    const port = parseFloat(portHandling) || 0;
    const lastm = parseFloat(lastMile) || 0;

    const dutyAmt = cif * duty;
    const vatBase = cif + dutyAmt;
    const vatAmt = vatBase * vat;
    const miscTotal = agent + port + lastm;
    const landed = cif + dutyAmt + vatAmt + miscTotal;
    const perUnit = landed / q;
    const cifPerUnit = cif / q;
    const markupPct = cif > 0 ? ((landed - cif) / cif) * 100 : 0;

    return { cif, dutyAmt, vatAmt, miscTotal, landed, perUnit, cifPerUnit, markupPct, q };
  }, [cifValue, qty, dutyRate, vatRate, agentFee, portHandling, lastMile]);

  const hasData = (parseFloat(cifValue) || 0) > 0;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Landed Cost Calculator
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Calculate the total cost for your buyer at their destination — including import duties, taxes, and local charges.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Inputs */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Shipment Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="CIF value (₹)" hint="Total CIF for this shipment">
                <NumberInput value={cifValue} onChange={setCifValue} placeholder="e.g. 850000" prefix="₹" />
              </Field>
              <Field label="Quantity (units)">
                <NumberInput value={qty} onChange={setQty} placeholder="e.g. 1000" />
              </Field>
            </div>

            <Field label="Destination country">
              <select
                value={destKey}
                onChange={(e) => setDestKey(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
              >
                {Object.entries(DESTINATION_DUTIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
                <option value="OTHER">Other (manual entry)</option>
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Import duty rate (%)" hint="Applied on CIF value">
                <NumberInput value={dutyRate} onChange={setDutyRate} placeholder="e.g. 5" suffix="%" />
              </Field>
              <Field label="GST / VAT rate (%)" hint="Applied on CIF + duty">
                <NumberInput value={vatRate} onChange={setVatRate} placeholder="e.g. 20" suffix="%" />
              </Field>
            </div>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Local charges at destination (₹)
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Customs agent fee">
                  <NumberInput value={agentFee} onChange={setAgentFee} placeholder="e.g. 8000" prefix="₹" />
                </Field>
                <Field label="Port / handling">
                  <NumberInput value={portHandling} onChange={setPortHandling} placeholder="e.g. 5000" prefix="₹" />
                </Field>
                <Field label="Last-mile delivery">
                  <NumberInput value={lastMile} onChange={setLastMile} placeholder="e.g. 3000" prefix="₹" />
                </Field>
              </div>
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
                  {ratesLive && <span className="text-india-green-500 font-medium"> · live</span>}
                </p>
              )}
            </Field>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Landed Cost Breakdown
              </h2>

              {!hasData ? (
                <div className="py-10 text-center">
                  <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Enter CIF value to see results</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <Row label="CIF Value" sub="Your price including freight & insurance" inr={calc.cif} perUnit={calc.cifPerUnit} currency={currency} rates={rates} muted />
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                  <Row label={`Import Duty (${dutyRate}%)`} sub="Applied on CIF value" inr={calc.dutyAmt} perUnit={calc.dutyAmt / calc.q} currency={currency} rates={rates} />
                  {calc.vatAmt > 0 && (
                    <Row label={`GST / VAT (${vatRate}%)`} sub="Applied on CIF + duty" inr={calc.vatAmt} perUnit={calc.vatAmt / calc.q} currency={currency} rates={rates} />
                  )}
                  {calc.miscTotal > 0 && (
                    <Row label="Local charges" sub="Agent + port + last-mile" inr={calc.miscTotal} perUnit={calc.miscTotal / calc.q} currency={currency} rates={rates} />
                  )}
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                  <Row label="Total Landed Cost" sub="What your buyer actually pays" inr={calc.landed} perUnit={calc.perUnit} currency={currency} rates={rates} highlight />

                  {/* Markup badge */}
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <TrendingUp className="h-4 w-4 text-saffron-500 shrink-0" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Landed cost is{" "}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {calc.markupPct.toFixed(1)}% higher
                      </span>{" "}
                      than your CIF price
                    </p>
                  </div>
                </div>
              )}
            </div>

            {hasData && (
              <div className="rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800/40 p-4">
                <p className="text-xs text-saffron-700 dark:text-saffron-300 leading-relaxed">
                  <strong>Tip:</strong> Use this to help your buyer understand their true cost of importing. If landed cost is too high, consider reducing CIF price or exploring FTA benefits to lower the duty rate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Duty rates reference */}
        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowBreakdown((p) => !p)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Indicative Import Duty Rates by Country
            </span>
            {showBreakdown ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </button>
          {showBreakdown && (
            <div className="px-6 pb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left py-2 text-xs font-semibold text-zinc-500">Country</th>
                    <th className="text-right py-2 text-xs font-semibold text-zinc-500">Avg Duty</th>
                    <th className="text-right py-2 text-xs font-semibold text-zinc-500">GST / VAT</th>
                    <th className="text-left py-2 text-xs font-semibold text-zinc-500 pl-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: "USA", duty: "0–25%", vat: "None", note: "Varies widely; Section 301 tariffs apply on China-origin goods" },
                    { c: "EU", duty: "0–17%", vat: "20% avg", note: "MFN rate; India-EU FTA under negotiation" },
                    { c: "UK", duty: "0–12%", vat: "20%", note: "GSTR successor; UKTIA under negotiation" },
                    { c: "UAE", duty: "5%", vat: "5%", note: "GCC uniform tariff; CEPA with India reduces duty" },
                    { c: "Singapore", duty: "0%", vat: "9% GST", note: "CECA with India; near zero tariffs" },
                    { c: "Japan", duty: "0–9%", vat: "10%", note: "India-Japan CEPA; many products at 0%" },
                    { c: "Australia", duty: "0–10%", vat: "10% GST", note: "ECTA with India from 2022; staged reductions" },
                    { c: "Saudi Arabia", duty: "5–15%", vat: "15%", note: "GCC tariff; selective higher rates on some products" },
                  ].map((row) => (
                    <tr key={row.c} className="border-b border-zinc-50 dark:border-zinc-800/50">
                      <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{row.c}</td>
                      <td className="py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{row.duty}</td>
                      <td className="py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{row.vat}</td>
                      <td className="py-2.5 pl-4 text-xs text-zinc-400">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-zinc-400">
                * Rates are indicative. Actual rates depend on HS code and applicable FTAs. Use the FTA Advantage tool for precise calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
  value, onChange, placeholder, prefix, suffix,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; suffix?: string;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-sm text-zinc-400 pointer-events-none">{prefix}</span>}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}`}
      />
      {suffix && <span className="absolute right-3 text-sm text-zinc-400 pointer-events-none">{suffix}</span>}
    </div>
  );
}

function Row({
  label, sub, inr, perUnit, currency, rates, highlight, muted,
}: {
  label: string; sub: string; inr: number; perUnit: number; currency: string;
  rates: Record<string, number>; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg ${
      highlight ? "bg-saffron-50 dark:bg-saffron-900/20 ring-1 ring-saffron-200 dark:ring-saffron-800/40"
        : muted ? "opacity-70" : ""
    }`}>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${highlight ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-800 dark:text-zinc-200"}`}>
          {label}
        </p>
        <p className="text-xs text-zinc-400 truncate">{sub}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold tabular-nums ${highlight ? "text-saffron-600 dark:text-saffron-400" : "text-zinc-900 dark:text-zinc-50"}`}>
          {fmt(inr, currency, rates)}
        </p>
        <p className="text-xs text-zinc-400 tabular-nums">{fmt(perUnit, currency, rates)}/unit</p>
      </div>
    </div>
  );
}
