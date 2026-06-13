"use client";

import { useState, useRef } from "react";
import {
  MapPin,
  Search,
  Package,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Globe2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const PRODUCT_CATEGORIES = [
  { id: "textiles", label: "Textiles & Apparel", hs: "Ch. 50–63" },
  { id: "food-agri", label: "Food & Agricultural", hs: "Ch. 01–24" },
  { id: "pharma", label: "Pharmaceuticals", hs: "Ch. 30" },
  { id: "chemicals", label: "Chemicals & Dyes", hs: "Ch. 28–38" },
  { id: "gems-jewellery", label: "Gems & Jewellery", hs: "Ch. 71" },
  { id: "leather-footwear", label: "Leather & Footwear", hs: "Ch. 41–64" },
  { id: "engineering", label: "Engineering Goods", hs: "Ch. 72–84" },
  { id: "electronics", label: "Electronics & Electrical", hs: "Ch. 85–86" },
  { id: "auto-components", label: "Auto Components", hs: "Ch. 87" },
  { id: "furniture", label: "Furniture & Handicrafts", hs: "Ch. 44–94" },
  { id: "cosmetics", label: "Cosmetics & Toiletries", hs: "Ch. 33" },
  { id: "plastics", label: "Plastics & Rubber", hs: "Ch. 39–40" },
  { id: "marine", label: "Marine Products", hs: "Ch. 03" },
  { id: "spices", label: "Spices & Condiments", hs: "Ch. 09" },
  { id: "rice-cereals", label: "Rice & Cereals", hs: "Ch. 10" },
];

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "UAE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
];

const STAGES = [
  { id: "new", label: "New to exporting" },
  { id: "registered", label: "Registered (IEC obtained)" },
  { id: "experienced", label: "Experienced exporter" },
];

export default function MarketEntryPage() {
  const [productCat, setProductCat] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState("registered");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const selectedCat = PRODUCT_CATEGORIES.find((c) => c.id === productCat);

  async function generate() {
    if (!productCat || !country) {
      setError("Please select a product category and destination country.");
      return;
    }
    setError("");
    setResult("");
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const prompt = `You are an expert in Indian export regulations and international trade. Generate a comprehensive Market Entry Checklist for the following:

**Product:** ${selectedCat?.label} (${selectedCat?.hs})${productDesc ? ` — specifically: ${productDesc}` : ""}
**Destination Country:** ${selectedCountry?.name}
**Exporter Stage:** ${STAGES.find((s) => s.id === stage)?.label}

Please provide a structured checklist covering:

## 1. Regulatory Requirements
- Key regulations and standards (e.g., FDA, CE marking, REACH, BIS equivalent)
- Mandatory certifications/testing before entry
- Labeling requirements (language, mandatory declarations, country of origin marking)
- Phytosanitary/food safety requirements (if applicable)

## 2. Import Duty & Taxes
- MFN import duty rate (approximate)
- Applicable FTA with India (if any) and preferential rate
- GST/VAT/other taxes at destination
- Anti-dumping duties or safeguard measures (if any)

## 3. Required Documents
- Mandatory export documents (from India)
- Additional documents required by destination country customs
- Certificates and attestations needed

## 4. Key Indian Registrations & Certifications Needed
- Which Indian certifications/licenses are required (APEDA, FSSAI, BIS, Textile Committee, etc.)
- Time to obtain each

## 5. Market Entry Timeline
Provide a realistic timeline from decision to first shipment (in weeks), mentioning key milestones.

## 6. Common Pitfalls & Watch Points
List 4–5 common mistakes Indian exporters make when entering this market with this product.

## 7. Useful Resources & Contacts
- Key government bodies/portals to contact
- Relevant trade associations or EPCs
- Where to find accurate HS code and duty rates

Keep it practical and specific to Indian exporters. Be concise but complete.`;

    try {
      const resp = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) {
        setError("Failed to generate checklist. Please try again.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === "text" && parsed.text) {
                text += parsed.text;
                setResult(text);
              }
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      if ((e as { name?: string }).name !== "AbortError") {
        setError("Connection error. Check your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Market Entry Checklist Generator
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate a comprehensive, AI-powered checklist of everything you need to enter a specific export market — certifications, duties, documents, timeline.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Product category */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Your Product</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Product category *</label>
                <div className="relative">
                  <select
                    value={productCat}
                    onChange={(e) => setProductCat(e.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm text-zinc-900 dark:text-zinc-50 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 appearance-none"
                  >
                    <option value="">Select category…</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label} — {c.hs}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Specific product <span className="font-normal text-zinc-400">(optional but recommended)</span>
                </label>
                <input
                  type="text"
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="e.g. organic basmati rice, cotton knitwear, surgical gloves"
                  className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Destination Market</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      country === c.code
                        ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className={`font-medium ${country === c.code ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Your Export Stage</p>
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    stage === s.id
                      ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className={`h-3 w-3 shrink-0 rounded-full border-2 ${stage === s.id ? "border-saffron-500 bg-saffron-500" : "border-zinc-400"}`} />
                  <span className={`text-sm font-medium ${stage === s.id ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Generating checklist…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Market Entry Checklist</>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="sticky top-6">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-zinc-400" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {result
                      ? `${selectedCat?.label ?? "Product"} → ${selectedCountry?.name ?? "Country"}`
                      : "Market Entry Checklist"}
                  </p>
                </div>
                {result && (
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-india-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div className="p-5 max-h-[700px] overflow-y-auto">
                {!result && !loading && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <MapPin className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-400">Select a product and country, then generate your checklist.</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">
                      The AI will cover regulations, duties, documents, timeline, and pitfalls.
                    </p>
                  </div>
                )}
                {loading && !result && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400 py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-saffron-500" />
                    Researching market entry requirements…
                  </div>
                )}
                {result && (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-strong:text-zinc-800 dark:prose-strong:text-zinc-100 prose-a:text-saffron-600 dark:prose-a:text-saffron-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {result && (
              <div className="mt-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-700 dark:text-zinc-300">Note:</strong> This checklist is AI-generated based on general knowledge. Always verify specific requirements with the destination country's customs authority and your CHA before shipping.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
