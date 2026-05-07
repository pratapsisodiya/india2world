"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChecklistTable, type DocumentItem } from "@/components/dashboard/ChecklistTable";
import { HS_CHAPTERS } from "@/app/data/hsCodes";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";
import Link from "next/link";
import { useActivityStore } from "@/store/activity";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function parseChecklistResponse(raw: string): DocumentItem[] | null {
  // Try direct JSON
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as DocumentItem[];
  } catch { /* */ }

  // Try JSON inside ```json ... ```
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) return parsed as DocumentItem[];
    } catch { /* */ }
  }

  return null;
}

function buildChecklistPrompt(hsChapter: string, destCode: string, ftaName?: string): string {
  const chapter = HS_CHAPTERS.find((c) => c.chapter === hsChapter);
  const dest = TOP_EXPORT_DESTINATIONS.find((d) => d.code === destCode);
  const ftaNote = ftaName ? ` Note: India-${dest?.name} ${ftaName} applies — include CEPA/FTA-specific CoO documents.` : "";

  return `Generate a complete export document checklist for an Indian exporter.

Product: Chapter ${hsChapter} — ${chapter?.title || "goods"}
Destination country: ${dest?.name || destCode} (${destCode})
Key regulators in destination: ${dest?.keyRegulators?.join(", ") || "Standard customs"}${ftaNote}

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "document": "document name",
    "mandatory": true,
    "issuedBy": "issuing authority",
    "estimatedDays": "X-Y working days",
    "estimatedCost": "₹X – ₹Y per consignment",
    "notes": "country-specific or product-specific note"
  }
]

Include in this order:
1. Standard export documents (shipping bill, commercial invoice, packing list, Bill of Lading/Airway Bill)
2. Certificate of Origin (standard + FTA/CEPA variant if applicable)
3. Product-specific documents based on HS chapter (e.g. phytosanitary for agri, CDSCO for pharma, Spices Board for spices)
4. Destination-specific import documents (FDA prior notice for US food, ESMA certificate for UAE, etc.)
5. Financial documents if applicable (LC, BRC)

Set mandatory=true only for documents strictly required by Indian export law or by ${dest?.name || destCode} customs. Set mandatory=false for recommended/conditional documents.`;
}

function ChecklistSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      {[...Array(7)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="mb-2 flex justify-between">
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${55 + (i % 3) * 15}%` }} />
          <div className="mt-1 h-3 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export default function ChecklistPage() {
  const [hsChapter, setHsChapter] = useState("");
  const [destCode, setDestCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DocumentItem[] | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logActivity = useActivityStore((s) => s.log);

  const dest = TOP_EXPORT_DESTINATIONS.find((d) => d.code === destCode);
  const chapter = HS_CHAPTERS.find((c) => c.chapter === hsChapter);

  async function handleGenerate() {
    if (!hsChapter || !destCode) return;
    setLoading(true);
    setItems(null);
    setRawFallback(null);
    setError(null);

    try {
      const prompt = buildChecklistPrompt(hsChapter, destCode, dest?.ftaWithIndia);
      const resp = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) throw new Error("Backend error");

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
            if (event.type === "text") full += event.text;
            else if (event.type === "done") done = true;
          } catch { continue; }
        }
      }

      const parsed = parseChecklistResponse(full);
      if (parsed) {
        setItems(parsed);
      } else {
        setRawFallback(full);
      }
      logActivity({
        kind: "checklist",
        label: `${chapter?.title ?? `Ch. ${hsChapter}`} → ${dest?.name ?? destCode}`,
        href: "/dashboard/checklist",
      });
    } catch {
      setError("Unable to generate checklist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Smart Document Checklist
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Export Document Checklist
        </h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Select your product category and destination country to get a complete, personalised document checklist with sources, timelines, and costs.
        </p>

        {/* Selector */}
        <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                HS Chapter / Product category
              </label>
              <select
                value={hsChapter}
                onChange={(e) => { setHsChapter(e.target.value); setItems(null); setRawFallback(null); }}
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
                Destination country
              </label>
              <select
                value={destCode}
                onChange={(e) => { setDestCode(e.target.value); setItems(null); setRawFallback(null); }}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select country…</option>
                {TOP_EXPORT_DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.flag} {d.name}{d.ftaWithIndia ? ` (${d.ftaWithIndia})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {dest?.ftaWithIndia && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-india-green-50 px-3 py-2 dark:bg-india-green-500/10">
              <span className="text-xs font-medium text-india-green-700 dark:text-india-green-400">
                🤝 {dest.ftaWithIndia} applies — FTA CoO documents will be included
              </span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!hsChapter || !destCode || loading}
            className="mt-4 w-full rounded-lg bg-saffron-500 py-2.5 text-sm font-semibold text-white hover:bg-saffron-600 disabled:opacity-50"
          >
            {loading ? "Generating checklist…" : "Generate Checklist"}
          </button>
        </div>

        {/* Results */}
        {loading && <ChecklistSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
            {error}
          </div>
        )}

        {items && !loading && (
          <ChecklistTable
            items={items}
            productLabel={`Ch. ${hsChapter} — ${chapter?.title || ""}`}
            countryLabel={`${dest?.flag ?? ""} ${dest?.name ?? destCode}`}
          />
        )}

        {rawFallback && !loading && (
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <p className="mb-3 text-xs text-zinc-500">AI response (could not parse as structured table):</p>
            <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawFallback}</ReactMarkdown>
            </div>
            <button
              onClick={handleGenerate}
              className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !items && !rawFallback && !error && (
          <div className="mt-2 text-center">
            <p className="text-sm text-zinc-400">
              Select a product and country above, then click Generate.
            </p>
            <p className="mt-4 text-xs text-zinc-400">
              Popular combinations:{" "}
              <button onClick={() => { setHsChapter("09"); setDestCode("AE"); }} className="text-saffron-600 hover:underline">Spices → UAE</button>
              {" · "}
              <button onClick={() => { setHsChapter("61"); setDestCode("US"); }} className="text-saffron-600 hover:underline">Apparel → USA</button>
              {" · "}
              <button onClick={() => { setHsChapter("30"); setDestCode("US"); }} className="text-saffron-600 hover:underline">Pharma → USA</button>
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/chat?q=What documents do I need to export spices to UAE?"
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Or ask the AI directly →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
