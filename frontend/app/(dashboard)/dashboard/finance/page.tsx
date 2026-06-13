"use client";

import { useState, useMemo } from "react";
import {
  Banknote,
  Shield,
  TrendingUp,
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Calculator,
} from "lucide-react";

const TABS = [
  { id: "ecgc", label: "ECGC Insurance", icon: Shield },
  { id: "preshipment", label: "Pre-shipment Credit", icon: TrendingUp },
  { id: "postshipment", label: "Post-shipment Credit", icon: Banknote },
  { id: "exim", label: "EXIM Bank", icon: Building2 },
];

function fmt(val: number) {
  if (!isFinite(val)) return "—";
  return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtCr(val: number) {
  if (!isFinite(val) || val === 0) return "—";
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`;
  return fmt(val);
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("ecgc");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Export Finance Hub
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Explore ECGC insurance, pre/post-shipment credit, and EXIM Bank schemes to fund your exports.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeTab === tab.id
                    ? "bg-saffron-500 border-saffron-500 text-white"
                    : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300 bg-white dark:bg-zinc-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "ecgc" && <EcgcTab />}
        {activeTab === "preshipment" && <PreshipmentTab />}
        {activeTab === "postshipment" && <PostshipmentTab />}
        {activeTab === "exim" && <EximTab />}
      </div>
    </div>
  );
}

/* ─── ECGC Tab ───────────────────────────────────────────────────── */

function EcgcTab() {
  const [exportValue, setExportValue] = useState("");
  const [riskCategory, setRiskCategory] = useState("medium");

  const PREMIUM_RATES: Record<string, number> = {
    low: 0.55,
    medium: 0.90,
    high: 1.40,
  };

  const calc = useMemo(() => {
    const val = parseFloat(exportValue) || 0;
    const rate = PREMIUM_RATES[riskCategory] / 100;
    const annual = val * rate;
    const monthly = annual / 12;
    return { annual, monthly };
  }, [exportValue, riskCategory]);

  const hasData = (parseFloat(exportValue) || 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Info */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-india-green-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">ECGC Export Credit Insurance</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Protect your export receivables against buyer default, political risk, and insolvency.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { title: "ECIB (Short-term)", desc: "Covers 85–90% of losses for exports up to 180 days. Most popular for regular exporters." },
              { title: "Multi-Buyer Policy", desc: "Single policy covering all export shipments. Ideal for high-volume exporters." },
              { title: "Specific Buyer Policy", desc: "For large one-time or long-term contracts with a single buyer." },
              { title: "Small Exporter Policy", desc: "Simplified policy for exporters with annual turnover under ₹5 Cr." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="https://www.ecgc.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400"
          >
            <ExternalLink className="h-4 w-4" />
            Visit ECGC official website
          </a>
        </div>

        {/* Calculator */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-saffron-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Premium Estimator</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Annual export value (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                <input
                  type="number"
                  value={exportValue}
                  onChange={(e) => setExportValue(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Buyer risk category</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "low", label: "Low Risk", rate: "0.55%", sub: "Large corporates, OECD countries" },
                  { id: "medium", label: "Medium", rate: "0.90%", sub: "Standard commercial buyers" },
                  { id: "high", label: "High Risk", rate: "1.40%", sub: "New buyers, high-risk markets" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRiskCategory(r.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      riskCategory === r.id
                        ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${riskCategory === r.id ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {r.label}
                    </p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{r.rate}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{r.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {hasData ? (
              <div className="rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800/40 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Annual premium</span>
                  <span className="text-lg font-bold text-saffron-700 dark:text-saffron-300">{fmtCr(calc.annual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Monthly cost</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmtCr(calc.monthly)}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  In return, ECGC covers 85–90% of losses if a buyer defaults or becomes insolvent.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                <p className="text-sm text-zinc-400">Enter export value to see premium estimate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pre-shipment Credit Tab ────────────────────────────────────── */

function PreshipmentTab() {
  const [orderValue, setOrderValue] = useState("");
  const [creditPct, setCreditPct] = useState("75");
  const [period, setPeriod] = useState("90");
  const [creditType, setCreditType] = useState("pcfc");

  const RATES: Record<string, { rate: number; label: string }> = {
    pcfc: { rate: 5.5, label: "PCFC (USD) — LIBOR + 1.5%" },
    epc: { rate: 7.5, label: "EPC (INR) — Base rate + 1%" },
    pscfc: { rate: 5.8, label: "PSFC in FCY" },
  };

  const calc = useMemo(() => {
    const val = parseFloat(orderValue) || 0;
    const pct = Math.min(parseFloat(creditPct) || 75, 100) / 100;
    const days = parseFloat(period) || 90;
    const rate = RATES[creditType].rate / 100;
    const creditAmt = val * pct;
    const interest = creditAmt * rate * (days / 365);
    return { creditAmt, interest };
  }, [orderValue, creditPct, period, creditType]);

  const hasData = (parseFloat(orderValue) || 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-8 w-8 text-saffron-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Pre-shipment Credit</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Fund your production and procurement before you ship the goods.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { title: "Packing Credit (EPC) — INR", desc: "Short-term INR loan against export order. Eligible amount up to 75–90% of FOB value. Tenure up to 180 days.", tag: "Common" },
              { title: "PCFC — Foreign Currency", desc: "Pre-shipment credit in foreign currency. Lower interest rate (LIBOR+). Convert export proceeds to repay.", tag: "Cost-Effective" },
              { title: "Gold Card Scheme", desc: "Pre-approved credit line for exporters with 3+ years track record. Instant credit, minimal paperwork.", tag: "Fast" },
              { title: "ECGC-backed Credit", desc: "Banks extend higher credit if shipment is ECGC insured. ECGC guarantee covers 90% of bank's risk.", tag: "Higher Limit" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-saffron-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Credit Estimator</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Export order value (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                <input type="number" value={orderValue} onChange={(e) => setOrderValue(e.target.value)} placeholder="e.g. 5000000" className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Credit type</label>
              <div className="flex flex-col gap-2">
                {Object.entries(RATES).map(([k, v]) => (
                  <button key={k} onClick={() => setCreditType(k)} className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors ${creditType === k ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20" : "border-zinc-200 dark:border-zinc-700"}`}>
                    <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${creditType === k ? "border-saffron-500 bg-saffron-500" : "border-zinc-400"}`} />
                    <span className={creditType === k ? "text-saffron-700 dark:text-saffron-300 font-medium" : "text-zinc-600 dark:text-zinc-400"}>
                      {v.label} — <strong>{v.rate}% p.a.</strong>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Credit % of order</label>
                <div className="relative">
                  <input type="number" value={creditPct} onChange={(e) => setCreditPct(e.target.value)} min="10" max="100" className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Loan period (days)</label>
                <input type="number" value={period} onChange={(e) => setPeriod(e.target.value)} min="30" max="360" className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
            </div>

            {hasData ? (
              <div className="rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800/40 p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Eligible credit amount</span>
                  <span className="text-lg font-bold text-saffron-700 dark:text-saffron-300">{fmtCr(calc.creditAmt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Estimated interest ({period} days)</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmtCr(calc.interest)}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Actual rates and eligibility are determined by your bank. This is an indicative estimate.</p>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                <p className="text-sm text-zinc-400">Enter order value to see estimate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Post-shipment Credit Tab ───────────────────────────────────── */

function PostshipmentTab() {
  const [invoiceValue, setInvoiceValue] = useState("");
  const [termDays, setTermDays] = useState("60");
  const [discountRate, setDiscountRate] = useState("8.5");

  const calc = useMemo(() => {
    const val = parseFloat(invoiceValue) || 0;
    const days = parseFloat(termDays) || 60;
    const rate = (parseFloat(discountRate) || 0) / 100;
    const interest = val * rate * (days / 365);
    const netAdvance = val - interest;
    return { interest, netAdvance, val };
  }, [invoiceValue, termDays, discountRate]);

  const hasData = (parseFloat(invoiceValue) || 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <Banknote className="h-8 w-8 text-india-green-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Post-shipment Credit</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Get immediate cash against export invoices after shipment — don't wait 30–90 days for payment.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { title: "Export Bill Negotiation", desc: "Submit shipping documents to bank immediately. Bank pays you after deducting discount. Used with LC." },
              { title: "Export Bill Purchase / Discounting", desc: "Bank buys your export bill at a discount for DA/DP terms. You get cash; bank collects from buyer." },
              { title: "PSFC in Foreign Currency", desc: "Post-shipment credit in USD/EUR. Lower cost if your buyer pays in FCY. Repay with export proceeds." },
              { title: "Factoring (Forfaiting)", desc: "Sell receivables to a factoring house at a discount. No recourse — they take buyer default risk." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-saffron-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bill Discounting Estimator</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Export invoice value (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                <input type="number" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} placeholder="e.g. 2500000" className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Usance period (days)</label>
                <input type="number" value={termDays} onChange={(e) => setTermDays(e.target.value)} className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Discount rate (% p.a.)</label>
                <div className="relative">
                  <input type="number" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                </div>
              </div>
            </div>

            {hasData ? (
              <div className="rounded-xl bg-india-green-50 dark:bg-india-green-900/20 border border-india-green-200 dark:border-india-green-800/40 p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Invoice amount</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmtCr(calc.val)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Discount / interest</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">− {fmtCr(calc.interest)}</span>
                </div>
                <div className="h-px bg-india-green-100 dark:bg-india-green-800/40" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">You receive upfront</span>
                  <span className="text-lg font-bold text-india-green-700 dark:text-india-green-300">{fmtCr(calc.netAdvance)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                <p className="text-sm text-zinc-400">Enter invoice value to see estimate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXIM Bank Tab ──────────────────────────────────────────────── */

function EximTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const schemes = [
    {
      id: "overseas-investment",
      title: "Overseas Investment Finance",
      badge: "Long-term",
      desc: "Finance for Indian companies setting up/acquiring overseas units or JVs to boost exports.",
      eligibility: "Indian companies with minimum 3 years of export track record.",
      limit: "Up to ₹500 Cr or USD 50 Mn",
      tenure: "Up to 10 years",
      link: "https://www.eximbankindia.in",
    },
    {
      id: "buyer-credit",
      title: "Buyer's Credit (Line of Credit)",
      badge: "Trade Finance",
      desc: "EXIM Bank extends credit to overseas importers to buy Indian goods. You get paid upfront; buyer pays EXIM over time.",
      eligibility: "Exporters of capital goods, project exports, and high-value goods.",
      limit: "USD 5 Mn+",
      tenure: "1–10 years based on goods type",
      link: "https://www.eximbankindia.in",
    },
    {
      id: "project-exports",
      title: "Project Export Finance",
      badge: "Infrastructure",
      desc: "Finance for Indian contractors executing overseas construction and turnkey projects.",
      eligibility: "Registered project exporters with valid LOC from overseas buyer.",
      limit: "Up to 100% of contract value",
      tenure: "Up to 14 years",
      link: "https://www.eximbankindia.in",
    },
    {
      id: "sme-clusters",
      title: "Finance for SME Export Clusters",
      badge: "MSME",
      desc: "Working capital and term loans for MSME exporters. Includes equipment financing and pre-shipment credit.",
      eligibility: "MSMEs with IEC and at least 1 year export history.",
      limit: "Up to ₹5 Cr per unit",
      tenure: "Up to 7 years for term loans",
      link: "https://www.eximbankindia.in",
    },
    {
      id: "ecib",
      title: "Export Credit Insurance for Banks (ECIB)",
      badge: "Risk Cover",
      desc: "EXIM Bank co-insures bank's pre/post-shipment credit against buyer/country risk. Enables banks to lend more.",
      eligibility: "Commercial banks extending export credit.",
      limit: "Covers up to 90% of bank exposure",
      tenure: "Aligned with credit tenure",
      link: "https://www.eximbankindia.in",
    },
    {
      id: "wcs",
      title: "Working Capital Support (WCS)",
      badge: "Working Capital",
      desc: "Short-term working capital loan for exporters. Quick sanction with minimal collateral for established exporters.",
      eligibility: "Exporters with 3+ years of exports and good banking relationship.",
      limit: "Up to ₹50 Cr",
      tenure: "180 days (renewable)",
      link: "https://www.eximbankindia.in",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex items-start gap-4 mb-2">
        <Building2 className="h-10 w-10 text-saffron-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Export-Import Bank of India</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            EXIM Bank is the premier institution for financing, facilitating, and promoting India's international trade. Below are key schemes for exporters.
          </p>
          <a href="https://www.eximbankindia.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400">
            <ExternalLink className="h-3.5 w-3.5" />
            Visit exim bank India
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {schemes.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.title}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400">{s.badge}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
              {expanded === s.id ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
            </button>
            {expanded === s.id && (
              <div className="px-5 pb-5 grid sm:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Eligibility</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.eligibility}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Loan Limit</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.limit}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Tenure</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.tenure}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Loan limits, rates, and eligibility change frequently. Visit <strong className="text-zinc-700 dark:text-zinc-300">eximbankindia.in</strong> or contact your nearest EXIM Bank regional office for the latest terms.
        </p>
      </div>
    </div>
  );
}
