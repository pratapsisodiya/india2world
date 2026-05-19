"use client";

import { useState, useRef } from "react";
import { WizardShell } from "@/components/dashboard/WizardShell";
import { ReadinessScoreCard } from "@/components/dashboard/ReadinessScoreCard";
import { ReadinessActionPlan } from "@/components/dashboard/ReadinessActionPlan";
import {
  computeReadinessScore,
  buildReadinessPrompt,
  type ReadinessAnswer,
  type RegistrationStatus,
  type TurnoverRange,
  type ExperienceLevel,
  type ReadinessScore,
} from "@/app/data/readiness";
import { useUserStore } from "@/store/user";
import { useActivityStore } from "@/store/activity";
import { cn } from "@/lib/cn";
import { useSSE } from "@/hooks/useSSE";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function ScoreHistoryPanel() {
  const history = useUserStore((s) => s.profile.scoreHistory);
  if (!history || history.length < 2) return null;
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Score history</h3>
      <div className="flex flex-col gap-2">
        {history.slice(0, 5).map((h, i) => (
          <div key={h.ts} className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {i === 0 ? "Latest" : new Date(h.ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {h.sector ? ` · ${h.sector}` : ""}
            </span>
            <span className={`text-xs font-bold ${h.score >= 70 ? "text-green-600 dark:text-green-400" : h.score >= 40 ? "text-saffron-600 dark:text-saffron-400" : "text-red-500"}`}>
              {h.score}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTOR_OPTIONS = [
  "Textiles & Apparel",
  "Handicrafts",
  "Spices & Agriculture",
  "Gems & Jewellery",
  "Engineering Goods",
  "Pharma & Life Sciences",
  "IT & ITES Services",
  "Leather & Footwear",
  "Other",
];

const REGISTRATION_OPTIONS: { value: RegistrationStatus; label: string; description: string }[] = [
  { value: "iec", label: "IEC", description: "Importer Exporter Code from DGFT" },
  { value: "gst", label: "GST", description: "GST registration" },
  { value: "gst-lut", label: "GST LUT", description: "Letter of Undertaking for zero-rated exports" },
  { value: "rcmc", label: "RCMC", description: "Registration from Export Promotion Council" },
  { value: "product-licence", label: "Product Licence", description: "APEDA, Spices Board, CDSCO, FSSAI, etc." },
];

const TURNOVER_OPTIONS: { value: TurnoverRange; label: string }[] = [
  { value: "under-50L", label: "Under ₹50 Lakh" },
  { value: "50L-1Cr", label: "₹50 L – ₹1 Cr" },
  { value: "1Cr-5Cr", label: "₹1 Cr – ₹5 Cr" },
  { value: "5Cr-25Cr", label: "₹5 Cr – ₹25 Cr" },
  { value: "above-25Cr", label: "Above ₹25 Cr" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "never", label: "Never exported", description: "No shipments yet, exploring options" },
  { value: "exploring", label: "Actively exploring", description: "Researching procedures, no shipment yet" },
  { value: "first-shipment", label: "Done first shipment", description: "At least one export completed" },
  { value: "scaling", label: "Scaling exports", description: "Regular exporter, growing volume" },
];

const TARGET_MARKETS = [
  "UAE", "USA", "UK", "Germany", "Singapore", "Australia",
  "Japan", "Bangladesh", "Sri Lanka", "Saudi Arabia",
  "France", "Netherlands", "South Korea", "Malaysia", "Not decided yet",
];

const WIZARD_STEPS = ["Sector", "Products", "Registrations", "Market", "Financials", "Experience"];

const EMPTY_ANSWER: ReadinessAnswer = {
  sector: "",
  products: "",
  registrations: [],
  targetMarket: "",
  turnoverRange: "under-50L",
  experienceLevel: "never",
};

export default function ReadinessPage() {
  const setProfile = useUserStore((s) => s.setProfile);
  const pushScoreHistory = useUserStore((s) => s.pushScoreHistory);
  const logActivity = useActivityStore((s) => s.log);

  const { startStream, stop, buffer, setBuffer } = useSSE();
  const stopRef = useRef(stop);

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<ReadinessAnswer>({ ...EMPTY_ANSWER });
  const [score, setScore] = useState<ReadinessScore | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  function canProceed(): boolean {
    switch (step) {
      case 0: return !!answer.sector;
      case 1: return answer.products.trim().length > 0;
      case 2: return true; // registrations optional
      case 3: return !!answer.targetMarket;
      case 4: return !!answer.turnoverRange;
      case 5: return !!answer.experienceLevel;
      default: return false;
    }
  }

  async function handleComplete() {
    const computed = computeReadinessScore(answer);
    setScore(computed);
    setProfile({ readinessScore: computed.total, sector: answer.sector });
    pushScoreHistory({ score: computed.total, sector: answer.sector, ts: Date.now() });
    logActivity({
      kind: "readiness",
      label: `Readiness score: ${computed.total}/100 — ${answer.sector}`,
      href: "/dashboard/readiness",
    });

    setLoadingPlan(true);
    try {
      const prompt = buildReadinessPrompt(answer, computed);
      let full = "";
      await startStream(
        `${BACKEND_URL}/api/chat`,
        { messages: [{ role: "user", content: prompt }] },
        {
          onEvent: (event) => {
            if (event.type === "text" && event.text) {
              full += event.text;
              setBuffer(full);
            }
          },
          onError: () => {
            throw new Error("Backend error");
          },
        }
      );
    } catch {
      setBuffer("Unable to generate action plan — please try again or ask the AI chat directly.");
    } finally {
      setLoadingPlan(false);
    }
  }

  if (!started) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-saffron-50 text-3xl dark:bg-saffron-500/10">
              🎯
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Export Readiness Score
              </h1>
              <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
                6 questions, 2 minutes. Find out how ready your business is to export from India — with a visual score and personalised AI action plan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
              {["Documentation", "Market Knowledge", "Financial Readiness", "Compliance"].map((cat) => (
                <div key={cat} className="rounded-lg bg-white p-3 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">{cat}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">scored /25</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStarted(true)}
              className="rounded-xl bg-saffron-500 px-8 py-3 text-base font-semibold text-white hover:bg-saffron-600"
            >
              Start assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (score) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Export Readiness Score
          </div>
          <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Your results for {answer.sector}
          </h1>
          <div className="flex flex-col gap-6">
            <ReadinessScoreCard score={score} />
            <ReadinessActionPlan content={buffer} loading={loadingPlan} />
            <ScoreHistoryPanel />
            <button
              onClick={() => { stopRef.current(); setStarted(false); setStep(0); setAnswer({ ...EMPTY_ANSWER }); setScore(null); setBuffer(""); }}
              className="self-start text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              ← Retake assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Export Readiness Score
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {WIZARD_STEPS[step]}
          </h1>
        </div>
        <WizardShell
          steps={WIZARD_STEPS}
          currentStep={step}
          onNext={() => setStep((s) => s + 1)}
          onBack={() => setStep((s) => s - 1)}
          onComplete={handleComplete}
          canProceed={canProceed()}
          completionLabel="Get My Score"
        >
          {step === 0 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Which sector do you primarily export from?
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SECTOR_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, sector: s }))}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      answer.sector === s
                        ? "border-saffron-500 bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What products do you export or plan to export?
              </label>
              <textarea
                value={answer.products}
                onChange={(e) => setAnswer((a) => ({ ...a, products: e.target.value }))}
                placeholder="e.g. black pepper, turmeric, spice mixes"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              />
              <p className="mt-2 text-xs text-zinc-500">Be specific — this helps personalise your action plan.</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Which registrations have you already completed? <span className="font-normal text-zinc-400">(select all that apply)</span>
              </p>
              <div className="space-y-2">
                {REGISTRATION_OPTIONS.map((opt) => {
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
                        checked
                          ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center",
                        checked ? "border-saffron-500 bg-saffron-500" : "border-zinc-300 dark:border-zinc-600"
                      )}>
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
              <p className="mt-3 text-xs text-zinc-500">Don&apos;t have any yet? That&apos;s fine — your action plan will guide you.</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Which country are you most interested in exporting to?
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TARGET_MARKETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, targetMarket: m }))}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      answer.targetMarket === m
                        ? "border-saffron-500 bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What is your approximate annual turnover?
              </p>
              <div className="space-y-2">
                {TURNOVER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, turnoverRange: opt.value }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      answer.turnoverRange === opt.value
                        ? "border-saffron-500 bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    {answer.turnoverRange === opt.value && (
                      <span className="text-xs text-saffron-600 dark:text-saffron-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What best describes your export experience?
              </p>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer((a) => ({ ...a, experienceLevel: opt.value }))}
                    className={cn(
                      "flex w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors",
                      answer.experienceLevel === opt.value
                        ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      answer.experienceLevel === opt.value ? "text-saffron-700 dark:text-saffron-400" : "text-zinc-900 dark:text-zinc-50"
                    )}>{opt.label}</span>
                    <span className="mt-0.5 text-xs text-zinc-500">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </WizardShell>
      </div>
    </div>
  );
}
