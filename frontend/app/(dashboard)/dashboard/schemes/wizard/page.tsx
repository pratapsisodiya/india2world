"use client";

import { useState } from "react";
import { WizardShell } from "@/components/dashboard/WizardShell";
import { SchemeMatchCard, type MatchedScheme } from "@/components/dashboard/SchemeMatchCard";
import { cn } from "@/lib/cn";
import { HS_CHAPTERS } from "@/app/data/hsCodes";
import Link from "next/link";

const BACKEND_URL = "";

type ExporterType = "manufacturer" | "merchant" | "service";
type FobRange = "under-50L" | "50L-1Cr" | "1Cr-5Cr" | "5Cr-25Cr" | "above-25Cr";
type Registration = "iec" | "gst" | "rcmc" | "msme";

interface WizardAnswer {
  exporterType: ExporterType | "";
  sector: string;
  hsChapter: string;
  fobRange: FobRange | "";
  registrations: Registration[];
}

const EMPTY: WizardAnswer = {
  exporterType: "",
  sector: "",
  hsChapter: "",
  fobRange: "",
  registrations: [],
};

const SECTOR_OPTIONS = [
  { value: "textiles", label: "Textiles & Apparel" },
  { value: "handicrafts", label: "Handicrafts" },
  { value: "spices", label: "Spices & Agriculture" },
  { value: "gems", label: "Gems & Jewellery" },
  { value: "engineering", label: "Engineering Goods" },
  { value: "pharma", label: "Pharma & Life Sciences" },
  { value: "it-ites", label: "IT & ITES Services" },
  { value: "leather", label: "Leather & Footwear" },
  { value: "other", label: "Other" },
];

const FOB_OPTIONS: { value: FobRange; label: string }[] = [
  { value: "under-50L", label: "Under ₹50 Lakh" },
  { value: "50L-1Cr", label: "₹50 L – ₹1 Cr" },
  { value: "1Cr-5Cr", label: "₹1 Cr – ₹5 Cr" },
  { value: "5Cr-25Cr", label: "₹5 Cr – ₹25 Cr" },
  { value: "above-25Cr", label: "Above ₹25 Cr" },
];

const REG_OPTIONS: { value: Registration; label: string; description: string }[] = [
  { value: "iec", label: "IEC", description: "Importer Exporter Code from DGFT" },
  { value: "gst", label: "GST", description: "GST registration" },
  { value: "rcmc", label: "RCMC", description: "Registration from Export Promotion Council" },
  { value: "msme", label: "MSME Certificate", description: "Udyam registration" },
];

const WIZARD_STEPS = ["Exporter type", "Sector", "HS Chapter", "FOB value", "Registrations"];

const FOB_TO_TURNOVER: Record<FobRange, string> = {
  "under-50L": "Under ₹50 Lakh",
  "50L-1Cr": "₹50L–₹1Cr",
  "1Cr-5Cr": "₹1Cr–₹5Cr",
  "5Cr-25Cr": "₹5Cr–₹25Cr",
  "above-25Cr": "Above ₹25Cr",
};

interface AiSchemeResult {
  analysisSteps?: string[];
  recommended: Array<{
    schemeId: string;
    schemeName: string;
    matchScore: number;
    reason: string;
    immediateAction: string;
    estimatedBenefit: string;
  }>;
  notRecommended: Array<{ schemeId: string; reason: string }>;
  profileGaps: string[];
  summary: string;
}

export default function SchemesWizardPage() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<WizardAnswer>({ ...EMPTY });
  const [results, setResults] = useState<MatchedScheme[] | null>(null);
  const [aiResult, setAiResult] = useState<AiSchemeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canProceed(): boolean {
    switch (step) {
      case 0: return !!answer.exporterType;
      case 1: return !!answer.sector;
      case 2: return true;
      case 3: return !!answer.fobRange;
      case 4: return true;
      default: return false;
    }
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      const body = {
        sector: answer.sector || "other",
        exportProducts: answer.hsChapter ? `HS Chapter ${answer.hsChapter}` : answer.sector || "general goods",
        businessType: answer.exporterType || "unknown",
        annualTurnover: answer.fobRange ? FOB_TO_TURNOVER[answer.fobRange as FobRange] : undefined,
        hasIEC: answer.registrations.includes("iec"),
        hasGST: answer.registrations.includes("gst"),
      };

      const resp = await fetch(`${BACKEND_URL}/api/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Server error ${resp.status}`);
      }

      const data: AiSchemeResult = await resp.json();
      setAiResult(data);

      // Map AI recommendations to MatchedScheme shape for SchemeMatchCard
      const matched: MatchedScheme[] = data.recommended.map((r) => ({
        id: r.schemeId,
        shortName: r.schemeName,
        name: r.schemeName,
        category: "financial" as const,
        summary: r.reason,
        eligibility: [],
        benefit: r.estimatedBenefit,
        howToClaim: r.immediateAction,
        applyAt: "DGFT portal / Customs (ICEGATE)",
        sectors: [answer.sector || "all"],
        link: "https://dgft.gov.in",
        matchStrength: r.matchScore >= 80 ? "strong" : "partial",
        estimatedBenefit: r.estimatedBenefit,
        personalizedSteps: r.immediateAction,
      }));
      setResults(matched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to match schemes. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (results !== null) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Find My Schemes
          </div>
          <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {results.length > 0 ? `${results.length} scheme${results.length > 1 ? "s" : ""} matched` : "No direct matches"}
          </h1>
          <p className="mb-6 text-sm text-zinc-500">
            Based on your profile as a <strong>{answer.exporterType}</strong> exporter in <strong>{answer.sector}</strong>.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
              {error}
            </div>
          )}

          {aiResult?.summary && (
            <div className="mb-5 rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{aiResult.summary}</p>
            </div>
          )}

          {aiResult?.analysisSteps && aiResult.analysisSteps.length > 0 && (
            <div className="mb-5 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">AI Reasoning</p>
              <ul className="space-y-1.5">
                {aiResult.analysisSteps.map((step, i) => (
                  <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">• {step}</li>
                ))}
              </ul>
            </div>
          )}

          {results.length === 0 && !error ? (
            <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No direct scheme matches for this profile. Try getting an IEC first — it unlocks most export incentives.
              </p>
              <Link href="/dashboard/chat?q=What registrations do I need to start exporting?" className="mt-4 inline-block rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
                Ask AI about registrations
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((s) => (
                <SchemeMatchCard key={s.id} scheme={s} loading={false} />
              ))}

              {aiResult?.profileGaps && aiResult.profileGaps.length > 0 && (
                <div className="mt-2 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/20">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Profile gaps to address</p>
                  <ul className="space-y-1">
                    {aiResult.profileGaps.map((gap, i) => (
                      <li key={i} className="text-sm text-amber-800 dark:text-amber-300">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-2 text-xs text-zinc-400">
                Benefit estimates are illustrative — verify current rates with DGFT or a customs broker.
              </p>
            </div>
          )}

          <button
            onClick={() => { setStep(0); setAnswer({ ...EMPTY }); setResults(null); setAiResult(null); setError(null); }}
            className="mt-6 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← Run again with different profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Find My Schemes
        </div>
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {WIZARD_STEPS[step]}
        </h1>

        <WizardShell
          steps={WIZARD_STEPS}
          currentStep={step}
          onNext={() => setStep((s) => s + 1)}
          onBack={() => setStep((s) => s - 1)}
          onComplete={handleComplete}
          canProceed={canProceed()}
          completionLabel="Find My Schemes"
        >
          {step === 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What type of exporter are you?
              </p>
              <div className="space-y-2">
                {([
                  { value: "manufacturer", label: "Manufacturer Exporter", description: "You manufacture and export your own products" },
                  { value: "merchant", label: "Merchant Exporter", description: "You source from manufacturers and export" },
                  { value: "service", label: "Service Exporter", description: "You export IT, BPO, or other services" },
                ] as { value: ExporterType; label: string; description: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, exporterType: opt.value }))}
                    className={cn(
                      "flex w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors",
                      answer.exporterType === opt.value
                        ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className={cn("text-sm font-medium", answer.exporterType === opt.value ? "text-saffron-700 dark:text-saffron-400" : "text-zinc-900 dark:text-zinc-50")}>{opt.label}</span>
                    <span className="mt-0.5 text-xs text-zinc-500">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Which sector?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SECTOR_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, sector: s.value }))}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      answer.sector === s.value
                        ? "border-saffron-500 bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select your main HS chapter <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <select
                value={answer.hsChapter}
                onChange={(e) => setAnswer((a) => ({ ...a, hsChapter: e.target.value }))}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select a chapter (optional)</option>
                {HS_CHAPTERS.map((c) => (
                  <option key={c.chapter} value={c.chapter}>
                    Chapter {c.chapter} — {c.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-zinc-500">This helps personalise scheme claim steps. You can skip if unsure.</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What is your approximate annual FOB export value?
              </p>
              <div className="space-y-2">
                {FOB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, fobRange: opt.value }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      answer.fobRange === opt.value
                        ? "border-saffron-500 bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    {answer.fobRange === opt.value && <span className="text-xs text-saffron-600 dark:text-saffron-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Which registrations do you currently hold? <span className="font-normal text-zinc-400">(select all that apply)</span>
              </p>
              <div className="space-y-2">
                {REG_OPTIONS.map((opt) => {
                  const checked = answer.registrations.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setAnswer((a) => ({
                          ...a,
                          registrations: checked
                            ? a.registrations.filter((r) => r !== opt.value)
                            : [...a.registrations, opt.value],
                        }))
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                        checked ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className={cn("h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center", checked ? "border-saffron-500 bg-saffron-500" : "border-zinc-300 dark:border-zinc-600")}>
                        {checked && <span className="text-[9px] font-bold text-white">✓</span>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{opt.label}</p>
                        <p className="text-xs text-zinc-500">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-zinc-500">None yet? Still worth running — you&apos;ll see what schemes await once you register.</p>
            </div>
          )}
        </WizardShell>
      </div>
    </div>
  );
}
