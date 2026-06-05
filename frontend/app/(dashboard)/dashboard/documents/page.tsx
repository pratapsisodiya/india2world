"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Plus, Trash2, Download, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";

const BACKEND_URL = "";

const DOC_TYPES = [
  { id: "proforma-invoice", label: "Proforma Invoice", desc: "Pre-shipment quote document for buyer approval" },
  { id: "commercial-invoice", label: "Commercial Invoice", desc: "Final invoice for customs and payment" },
  { id: "packing-list", label: "Packing List", desc: "Detailed list of packages, weights, and dimensions" },
  { id: "certificate-of-origin", label: "Certificate of Origin", desc: "Declares country of manufacture for customs" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD", "INR"];
const INCOTERMS = ["FOB", "CIF", "CFR", "EXW", "DDP", "DAP"];

interface ProductLine {
  id: string;
  description: string;
  hsCode: string;
  quantity: string;
  unitPrice: string;
  currency: string;
}

function newLine(): ProductLine {
  return { id: crypto.randomUUID(), description: "", hsCode: "", quantity: "1", unitPrice: "", currency: "USD" };
}

export default function DocumentGeneratorPage() {
  const profile = useUserStore((s) => s.profile);

  const [docType, setDocType] = useState("proforma-invoice");
  const [exporterName, setExporterName] = useState(profile.businessName || "");
  const [exporterAddress, setExporterAddress] = useState(profile.location ? `${profile.location}, India` : "");
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [incoterm, setIncoterm] = useState("FOB");
  const [portOfLoading, setPortOfLoading] = useState("Mumbai, India");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30% advance, 70% against BL copy");
  const [products, setProducts] = useState<ProductLine[]>([newLine()]);
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  function addLine() { setProducts((p) => [...p, newLine()]); }
  function removeLine(id: string) { setProducts((p) => p.filter((l) => l.id !== id)); }
  function updateLine(id: string, field: keyof ProductLine, value: string) {
    setProducts((p) => p.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  const total = products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const price = parseFloat(p.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  async function handleGenerate() {
    if (!exporterName.trim() || !buyerName.trim() || products.some((p) => !p.description || !p.unitPrice)) {
      setError("Please fill in exporter name, buyer name, and all product lines.");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedDoc("");

    try {
      const resp = await fetch(`${BACKEND_URL}/api/docs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          exporterName,
          exporterAddress,
          buyerName,
          buyerAddress,
          incoterm,
          portOfLoading,
          portOfDischarge,
          paymentTerms,
          products: products.map((p) => ({
            description: p.description,
            hsCode: p.hsCode || undefined,
            quantity: p.quantity,
            unitPrice: parseFloat(p.unitPrice) || 0,
            currency: p.currency,
          })),
        }),
      });

      if (!resp.ok || !resp.body) throw new Error(`Server error ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const raw = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 2);
          if (!raw.startsWith("data:")) continue;
          const payload = raw.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload) as { type: string; text?: string; message?: string };
            if (evt.type === "text" && evt.text) setGeneratedDoc((d) => d + evt.text);
            else if (evt.type === "error") throw new Error(evt.message ?? "Generation failed");
            else if (evt.type === "done") break;
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "JSON") throw parseErr;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([generatedDoc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Export Document Generator
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Generate professional export documents in seconds — proforma invoice, commercial invoice, packing list, certificate of origin.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left: Form ── */}
          <div className="space-y-5">
            {/* Doc type */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Document Type</h2>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDocType(d.id)}
                    className={cn(
                      "flex flex-col rounded-lg border p-3 text-left transition-colors",
                      docType === d.id
                        ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className={cn("text-xs font-semibold", docType === d.id ? "text-saffron-700 dark:text-saffron-400" : "text-zinc-800 dark:text-zinc-200")}>{d.label}</span>
                    <span className="mt-0.5 text-[10px] text-zinc-500 leading-snug">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Exporter + buyer */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Parties</h2>
              <Field label="Your company name" value={exporterName} onChange={setExporterName} placeholder="Sharma Exports Pvt Ltd" />
              <Field label="Your address" value={exporterAddress} onChange={setExporterAddress} placeholder="123 MIDC, Pune 411001, Maharashtra, India" textarea />
              <Field label="Buyer name" value={buyerName} onChange={setBuyerName} placeholder="Al Maktoum Trading LLC" />
              <Field label="Buyer address" value={buyerAddress} onChange={setBuyerAddress} placeholder="Dubai, UAE" textarea />
            </div>

            {/* Shipment details */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Shipment Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Incoterm</label>
                  <SelectField value={incoterm} onChange={setIncoterm} options={INCOTERMS} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Port of loading</label>
                  <input value={portOfLoading} onChange={(e) => setPortOfLoading(e.target.value)} className={inputCls} placeholder="Mumbai, India" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Port of discharge</label>
                  <input value={portOfDischarge} onChange={(e) => setPortOfDischarge(e.target.value)} className={inputCls} placeholder="Dubai, UAE" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Payment terms</label>
                  <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={inputCls} placeholder="30% advance, 70% BL" />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Products</h2>
                <button type="button" onClick={addLine}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                  <Plus className="h-3 w-3" /> Add line
                </button>
              </div>
              <div className="space-y-3">
                {products.map((line, i) => (
                  <div key={line.id} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400">#{i + 1}</span>
                      {products.length > 1 && (
                        <button type="button" onClick={() => removeLine(line.id)} className="ml-auto rounded p-0.5 text-zinc-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)}
                      className={inputCls} placeholder="Product description" />
                    <div className="grid grid-cols-3 gap-2">
                      <input value={line.hsCode} onChange={(e) => updateLine(line.id, "hsCode", e.target.value)}
                        className={inputCls} placeholder="HS Code" />
                      <input value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                        className={inputCls} placeholder="Qty" type="number" min="0" />
                      <div className="flex gap-1">
                        <input value={line.unitPrice} onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)}
                          className={cn(inputCls, "flex-1 min-w-0")} placeholder="Unit price" type="number" min="0" />
                        <SelectField value={line.currency} onChange={(v) => updateLine(line.id, "currency", v)} options={CURRENCIES} small />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <span className="text-xs font-medium text-zinc-500">Total value</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {products[0]?.currency} {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/20">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-600 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? "Generating…" : "Generate Document"}
            </button>
          </div>

          {/* ── Right: Preview ── */}
          <div className="sticky top-4 self-start">
            <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Preview</h2>
                {generatedDoc && (
                  <button type="button" onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                    <Download className="h-3.5 w-3.5" />
                    Download .md
                  </button>
                )}
              </div>
              <div ref={docRef} className="min-h-96 max-h-[70vh] overflow-y-auto p-5">
                {loading && !generatedDoc && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <p className="text-xs">Generating your document…</p>
                  </div>
                )}
                {!loading && !generatedDoc && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <FileText className="h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs">Your document will appear here</p>
                  </div>
                )}
                {generatedDoc && (
                  <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-table:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedDoc}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600";

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none resize-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}

function SelectField({ value, onChange, options, small }: {
  value: string; onChange: (v: string) => void; options: string[]; small?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border border-zinc-200 bg-white pr-6 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50",
          small ? "h-9 w-full px-2" : "h-9 w-full px-3"
        )}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}
