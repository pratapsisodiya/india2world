"use client";

import { useState, useRef } from "react";
import {
  Mail,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Send,
  User,
  Globe2,
  Package,
} from "lucide-react";

const EMAIL_TYPES = [
  { id: "cold", label: "Cold Outreach", desc: "First contact with a new potential buyer" },
  { id: "quotation", label: "Quotation Letter", desc: "Formal price quotation with terms" },
  { id: "followup", label: "Follow-up", desc: "Follow up after initial contact or quote" },
  { id: "intro", label: "Company Introduction", desc: "Introduce your company and capabilities" },
  { id: "seasonal", label: "Seasonal / Event", desc: "Festival greetings or trade fair invitation" },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function OutreachPage() {
  const [emailType, setEmailType] = useState("cold");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("");
  const [productName, setProductName] = useState("");
  const [usp1, setUsp1] = useState("");
  const [usp2, setUsp2] = useState("");
  const [usp3, setUsp3] = useState("");
  const [priceIndication, setPriceIndication] = useState("");
  const [yourName, setYourName] = useState("");
  const [yourCompany, setYourCompany] = useState("");
  const [yourTitle, setYourTitle] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly">("formal");

  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const selectedType = EMAIL_TYPES.find((t) => t.id === emailType)!;

  async function generate() {
    if (!productName || !buyerCompany || !yourName || !yourCompany) {
      setError("Please fill in the required fields: product name, buyer company, your name, and your company.");
      return;
    }
    setError("");
    setGenerated("");
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const usps = [usp1, usp2, usp3].filter(Boolean);

    const prompt = `Write a professional export business email for an Indian exporter.

Email type: ${selectedType.label}
Tone: ${tone}
Product: ${productName}
${usps.length > 0 ? `Key selling points / USPs:\n${usps.map((u, i) => `${i + 1}. ${u}`).join("\n")}` : ""}
${priceIndication ? `Price indication: ${priceIndication}` : ""}

Recipient:
- Name: ${buyerName || "(Buyer's name)"}
- Company: ${buyerCompany}
- Country: ${buyerCountry || "International"}

Sender:
- Name: ${yourName}
- Company: ${yourCompany}
- Title: ${yourTitle || "Export Manager"}

Instructions:
- Write a complete, ready-to-send email with Subject line, greeting, body, and sign-off.
- Keep it concise (150–250 words for body).
- For cold outreach: create curiosity and propose a next step (call/sample).
- For quotation: include placeholder brackets like [PRICE], [PAYMENT TERMS], [DELIVERY TIME] where the user should fill in specifics.
- For follow-up: be polite, reference prior conversation, suggest next action.
- Use professional export terminology (FOB, MOQ, lead time, samples).
- Do not fabricate specific numbers unless instructed.
- Format with "Subject:", then blank line, then the email body.`;

    try {
      const resp = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          provider: "openai",
        }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) {
        setError("Failed to generate email. Please try again.");
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
                setGenerated(text);
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

  function copyToClipboard() {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => {
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
            <Mail className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Buyer Outreach Templates
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate professional export emails — cold outreach, quotations, follow-ups — powered by AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
          {/* Form */}
          <div className="flex flex-col gap-5">

            {/* Email type */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Type</p>
              <div className="flex flex-col gap-2">
                {EMAIL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEmailType(t.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      emailType === t.id
                        ? "border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20 dark:border-saffron-600"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                      emailType === t.id ? "border-saffron-500 bg-saffron-500" : "border-zinc-400"
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${emailType === t.id ? "text-saffron-700 dark:text-saffron-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                        {t.label}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer info */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Buyer Details</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Buyer's name (optional)">
                  <TextInput value={buyerName} onChange={setBuyerName} placeholder="e.g. Mr. Ahmed Al-Rashid" />
                </Field>
                <Field label="Buyer's company *">
                  <TextInput value={buyerCompany} onChange={setBuyerCompany} placeholder="e.g. Gulf Foods LLC" />
                </Field>
              </div>
              <Field label="Buyer's country">
                <div className="relative">
                  <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <TextInput value={buyerCountry} onChange={setBuyerCountry} placeholder="e.g. UAE, UK, Singapore" className="pl-9" />
                </div>
              </Field>
            </div>

            {/* Product info */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Product & USPs</p>
              </div>
              <Field label="Product name *">
                <TextInput value={productName} onChange={setProductName} placeholder="e.g. Organic Basmati Rice, Handloom Cotton Fabric" />
              </Field>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Key selling points (up to 3)</label>
                <TextInput value={usp1} onChange={setUsp1} placeholder="e.g. FSSAI & BRC certified, 2-year shelf life" />
                <TextInput value={usp2} onChange={setUsp2} placeholder="e.g. MOQ 100 MT, can accommodate custom packaging" />
                <TextInput value={usp3} onChange={setUsp3} placeholder="e.g. Exporting to 12 countries since 2018" />
              </div>
              <Field label="Price indication (optional)">
                <TextInput value={priceIndication} onChange={setPriceIndication} placeholder="e.g. USD 450/MT FOB Mumbai" />
              </Field>
            </div>

            {/* Sender info */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Your Details</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Your name *">
                  <TextInput value={yourName} onChange={setYourName} placeholder="e.g. Rahul Sharma" />
                </Field>
                <Field label="Your title">
                  <TextInput value={yourTitle} onChange={setYourTitle} placeholder="e.g. Export Manager" />
                </Field>
              </div>
              <Field label="Your company *">
                <TextInput value={yourCompany} onChange={setYourCompany} placeholder="e.g. Sunrise Agro Exports Pvt Ltd" />
              </Field>
            </div>

            {/* Tone */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500">Tone:</span>
              {(["formal", "friendly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                    tone === t
                      ? "bg-saffron-500 border-saffron-500 text-white"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Email
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="sticky top-6">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Generated Email</p>
                {generated && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-india-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div className="p-5 min-h-[400px]">
                {!generated && !loading && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Mail className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-400">Your generated email will appear here.</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Fill in the details and click Generate.</p>
                  </div>
                )}
                {loading && !generated && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400 py-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-saffron-500" />
                    Writing your email…
                  </div>
                )}
                {generated && (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {generated}
                  </pre>
                )}
              </div>
            </div>

            {generated && (
              <div className="mt-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  <strong className="text-zinc-700 dark:text-zinc-300">Next step:</strong> Review the email, fill in any [PLACEHOLDER] values, personalise the subject line, and send from your business email address.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { title: "Keep subject lines short", body: "Under 50 characters. Make the value clear: \"Basmati Rice FOB USD 450 — Quote from India\"" },
            { title: "Follow up 3 times", body: "Most deals close after 3–5 touches. Space them 5–7 days apart. Vary your angle each time." },
            { title: "Offer samples early", body: "Buyers are more likely to respond if you offer a free or low-cost sample shipment upfront." },
          ].map((tip) => (
            <div key={tip.title} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">{tip.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none focus:ring-1 focus:ring-saffron-400 ${className}`}
    />
  );
}
