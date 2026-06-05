"use client";

import { useState } from "react";
import { useActivityStore } from "@/store/activity";
import { HS_CHAPTERS } from "@/app/data/hsCodes";
import {
  FTA_COUNTRY_MAP,
  getDutyRates,
  calculateSavings,
  type DutyRateEntry,
  type FtaCountryInfo,
} from "@/app/data/ftaData";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const BACKEND_URL = "";

const FTA_DESTINATIONS = TOP_EXPORT_DESTINATIONS.filter(
  (d) => d.ftaWithIndia
);

function formatInr(n: number): string {
  if (n >= 100) return `₹${(n / 100).toFixed(2)} Cr`;
  if (n >= 1) return `₹${n.toFixed(2)} L`;
  return `₹${Math.round(n * 100) * 1000}`;
}

function SavingsCalculator({
  mfnPct,
  preferentialPct,
}: {
  mfnPct: number;
  preferentialPct: number;
}) {
  const [fobLakh, setFobLakh] = useState(20);
  const { mfnDuty, preferentialDuty, saving } = calculateSavings(fobLakh, mfnPct, preferentialPct);

  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Savings calculator
      </h3>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Shipment FOB value (₹ Lakh)
        </label>
        <input
          type="range"
          min={1}
          max={500}
          step={1}
          value={fobLakh}
          onChange={(e) => setFobLakh(Number(e.target.value))}
          className="w-full accent-saffron-500"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>₹1 L</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">₹{fobLakh} L</span>
          <span>₹500 L</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
          <p className="text-xs text-zinc-500">MFN duty ({mfnPct}%)</p>
          <p className="mt-1 text-base font-bold text-red-600 dark:text-red-400">
            {formatInr(mfnDuty)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500">FTA duty ({preferentialPct}%)</p>
          <p className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-50">
            {preferentialPct === 0 ? "₹0" : formatInr(preferentialDuty)}
          </p>
        </div>
        <div className="rounded-lg bg-india-green-50 p-3 dark:bg-india-green-500/10">
          <p className="text-xs text-zinc-500">You save</p>
          <p className="mt-1 text-base font-bold text-india-green-600 dark:text-india-green-400">
            {formatInr(saving)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        Illustrative — based on indicative duty rates. Verify current rates with DGFT or a licensed customs broker.
      </p>
    </div>
  );
}

function CooGuide({ info }: { info: FtaCountryInfo }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        How to get your Certificate of Origin
      </h3>
      <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Form: </span>
          {info.cooForm}
        </div>
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Issued by: </span>
          {info.cooIssuingBody}
        </div>
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Process: </span>
          {info.cooProcess}
        </div>
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Rules of Origin: </span>
          {info.rooSummary}
        </div>
      </div>
    </div>
  );
}

export default function FtaPage() {
  const [hsChapter, setHsChapter] = useState("");
  const [destCode, setDestCode] = useState("");
  const [rateData, setRateData] = useState<DutyRateEntry | null | "not-found">(null);
  const [ftaInfo, setFtaInfo] = useState<FtaCountryInfo | null>(null);
  const [advisory, setAdvisory] = useState("");
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const logActivity = useActivityStore((s) => s.log);

  async function handleCalculate() {
    if (!hsChapter || !destCode) return;

    const rates = getDutyRates(hsChapter, destCode);
    const info = FTA_COUNTRY_MAP[destCode] ?? null;
    setRateData(rates ?? "not-found");
    setFtaInfo(info);
    setAdvisory("");
    const destEntry = TOP_EXPORT_DESTINATIONS.find((d) => d.code === destCode);
    const ch = HS_CHAPTERS.find((c) => c.chapter === hsChapter);
    logActivity({
      kind: "fta",
      label: `FTA: Ch.${hsChapter} ${ch?.title ? `(${ch.title.slice(0, 30)})` : ""} → ${destEntry?.name ?? destCode}`,
      href: "/dashboard/fta",
    });

    if (!info) return;

    // Fetch Claude advisory
    setLoadingAdvisory(true);
    const chapter = HS_CHAPTERS.find((c) => c.chapter === hsChapter);
    const dest = FTA_DESTINATIONS.find((d) => d.code === destCode);
    const prompt = `Give me 3 practical tips for an Indian exporter of ${chapter?.title || `Chapter ${hsChapter} goods`} exporting to ${dest?.name || destCode} for the first time under the ${info.fta}.

Focus on: (1) Certificate of Origin logistics, (2) timing/process, and (3) buyer communication or common pitfalls. Keep each tip to 2 sentences. Format as:
**Tip 1:** [title] — [explanation]
**Tip 2:** [title] — [explanation]
**Tip 3:** [title] — [explanation]`;

    try {
      const resp = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) throw new Error();
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const event = JSON.parse(payload);
            if (event.type === "text") { full += event.text; setAdvisory(full); }
            else if (event.type === "done") done = true;
          } catch { continue; }
        }
      }
    } catch {
      setAdvisory("Unable to load advisory. Try asking the AI chat directly.");
    } finally {
      setLoadingAdvisory(false);
    }
  }

  const dest = FTA_DESTINATIONS.find((d) => d.code === destCode);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          FTA Advantage Tool
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          FTA Tariff Advantage
        </h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          See how India&apos;s Free Trade Agreements reduce import duties for your product, calculate your savings per shipment, and get CoO guidance.
        </p>

        {/* Selector */}
        <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                HS Chapter / Product
              </label>
              <select
                value={hsChapter}
                onChange={(e) => { setHsChapter(e.target.value); setRateData(null); setAdvisory(""); }}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select HS chapter…</option>
                {HS_CHAPTERS.map((c) => (
                  <option key={c.chapter} value={c.chapter}>
                    Ch. {c.chapter} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                FTA partner country
              </label>
              <select
                value={destCode}
                onChange={(e) => { setDestCode(e.target.value); setRateData(null); setAdvisory(""); }}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select FTA country…</option>
                {FTA_DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.flag} {d.name} ({d.ftaWithIndia})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCalculate}
            disabled={!hsChapter || !destCode}
            className="mt-4 w-full rounded-lg bg-saffron-500 py-2.5 text-sm font-semibold text-white hover:bg-saffron-600 disabled:opacity-50"
          >
            Calculate FTA Advantage
          </button>
        </div>

        {/* Results */}
        {rateData && rateData !== "not-found" && ftaInfo && (
          <div className="flex flex-col gap-5">
            {/* Rate comparison */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Duty comparison — Ch. {hsChapter} to {dest?.flag} {dest?.name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-500/10">
                  <p className="text-xs text-zinc-500">MFN (standard) rate</p>
                  <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                    {rateData.mfnDutyRate}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">Without FTA</p>
                </div>
                <div className="rounded-lg bg-india-green-50 p-4 text-center dark:bg-india-green-500/10">
                  <p className="text-xs text-zinc-500">{rateData.fta} rate</p>
                  <p className="mt-1 text-3xl font-bold text-india-green-600 dark:text-india-green-400">
                    {rateData.preferentialRate}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">With CEPA/FTA CoO</p>
                </div>
              </div>
              {rateData.notes && (
                <p className="mt-3 text-xs text-zinc-500">{rateData.notes}</p>
              )}
            </div>

            <SavingsCalculator
              mfnPct={rateData.mfnDutyPct}
              preferentialPct={rateData.preferentialPct}
            />

            <CooGuide info={ftaInfo} />

            {/* AI Advisory */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  AI tips for first-time {rateData.fta} exporters
                </h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                  AI guidance — not official rates
                </span>
              </div>
              {loadingAdvisory ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              ) : advisory ? (
                <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{advisory}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3">
              <Link
                href={`/dashboard/chat?q=${encodeURIComponent(`How do I get a Certificate of Origin for ${rateData.fta}?`)}`}
                className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
              >
                Ask AI about {rateData.fta} CoO
              </Link>
              <Link
                href="/dashboard/checklist"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Full doc checklist →
              </Link>
            </div>
          </div>
        )}

        {rateData === "not-found" && ftaInfo && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {ftaInfo.fta} applies to {dest?.flag} {dest?.name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We don&apos;t have duty rates for Chapter {hsChapter} in our static table yet, but the FTA is active. Ask the AI for an estimate, then verify with DGFT.
              </p>
              <Link
                href={`/dashboard/chat?q=${encodeURIComponent(`What is the ${ftaInfo.fta} preferential duty rate for HS Chapter ${hsChapter} in ${dest?.name}?`)}`}
                className="mt-4 inline-block rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600"
              >
                Ask AI for duty rate estimate
              </Link>
            </div>
            <CooGuide info={ftaInfo} />
          </div>
        )}

        {rateData === "not-found" && !ftaInfo && (
          <div className="rounded-xl bg-amber-50 p-5 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/20">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              No FTA data found for this combination. This country may not have an active FTA with India for this product category.
            </p>
            <Link
              href={`/dashboard/chat?q=${encodeURIComponent(`Does India have an FTA with ${dest?.name} for Chapter ${hsChapter} goods?`)}`}
              className="mt-3 inline-block text-sm font-medium text-saffron-600 hover:underline dark:text-saffron-400"
            >
              Ask AI about FTA coverage →
            </Link>
          </div>
        )}

        {!rateData && (
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              Select a product and FTA partner country above to see duty savings.
            </p>
            <p className="mt-4 text-xs text-zinc-400">
              India&apos;s active FTAs:{" "}
              {["UAE CEPA", "Australia ECTA", "Japan CEPA", "Korea CEPA", "ASEAN", "SAFTA"].join(" · ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
