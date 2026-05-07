"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { Check } from "lucide-react";
import type { ReadinessScore } from "@/app/data/readiness";
import { useUserStore } from "@/store/user";

const SUB_LABELS: { key: keyof Omit<ReadinessScore, "total">; label: string; color: string }[] = [
  { key: "documentation", label: "Documentation & Registration", color: "bg-blue-500" },
  { key: "marketKnowledge", label: "Market Knowledge", color: "bg-india-green-500" },
  { key: "financialReadiness", label: "Financial Readiness", color: "bg-purple-500" },
  { key: "compliance", label: "Compliance & Licensing", color: "bg-saffron-500" },
];

function scoreLabel(n: number) {
  if (n >= 80) return { label: "Strong", color: "text-india-green-600 dark:text-india-green-400" };
  if (n >= 55) return { label: "Good", color: "text-saffron-600 dark:text-saffron-400" };
  if (n >= 30) return { label: "Developing", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Early stage", color: "text-red-600 dark:text-red-400" };
}

function RadialGauge({ score }: { score: number }) {
  const numRef = useRef<SVGTSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const r = 54;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const target = Math.min(100, Math.max(0, score));
    const offset = circumference - (target / 100) * circumference;

    if (circleRef.current) {
      animate(circumference, offset, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate: (v) => {
          if (circleRef.current) circleRef.current.style.strokeDashoffset = String(v);
        },
      });
    }
    if (numRef.current) {
      animate(0, target, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate: (v) => {
          if (numRef.current) numRef.current.textContent = Math.round(v).toString();
        },
      });
    }
  }, [score, circumference]);

  const { label, color } = scoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          ref={circleRef}
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#FF9933"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 70 70)"
          style={{ transition: "none" }}
        />
        <text x="70" y="66" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50" fontSize="28" fontWeight="700">
          <tspan ref={numRef}>0</tspan>
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#71717a" fontSize="11">
          out of 100
        </text>
      </svg>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
    </div>
  );
}

export function ReadinessScoreCard({ score }: { score: ReadinessScore }) {
  const setProfile = useUserStore((s) => s.setProfile);
  const savedScore = useUserStore((s) => s.profile.readinessScore);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setProfile({ readinessScore: score.total });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const alreadySaved = savedScore === score.total;

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <RadialGauge score={score.total} />
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Score breakdown</h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={alreadySaved}
              className="flex items-center gap-1 rounded-full bg-saffron-50 px-3 py-1 text-xs font-medium text-saffron-700 transition-colors hover:bg-saffron-100 disabled:opacity-50 dark:bg-saffron-500/15 dark:text-saffron-400 dark:hover:bg-saffron-500/25"
            >
              {saved ? (
                <><Check className="h-3 w-3" /> Saved!</>
              ) : alreadySaved ? (
                <><Check className="h-3 w-3" /> Saved to profile</>
              ) : (
                "Save to profile"
              )}
            </button>
          </div>
          {SUB_LABELS.map(({ key, label, color }) => {
            const val = score[key];
            const pct = (val / 25) * 100;
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{val}/25</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
