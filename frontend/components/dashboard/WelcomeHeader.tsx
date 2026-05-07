"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/user";
import { Badge } from "@/components/ui/Badge";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MiniGauge({ score }: { score: number }) {
  const numRef = useRef<SVGTSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const r = 24;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const target = Math.min(100, Math.max(0, score));
    const offset = circumference - (target / 100) * circumference;

    if (circleRef.current) {
      animate(circumference, offset, {
        duration: 1,
        ease: "easeOut",
        onUpdate: (v) => {
          if (circleRef.current) circleRef.current.style.strokeDashoffset = String(v);
        },
      });
    }
    if (numRef.current) {
      animate(0, target, {
        duration: 1,
        ease: "easeOut",
        onUpdate: (v) => {
          if (numRef.current) numRef.current.textContent = Math.round(v).toString();
        },
      });
    }
  }, [score, circumference]);

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="shrink-0">
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className="text-zinc-100 dark:text-zinc-800"
      />
      <circle
        ref={circleRef}
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="#FF9933"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        transform="rotate(-90 30 30)"
        style={{ transition: "none" }}
      />
      <text
        x="30"
        y="34"
        textAnchor="middle"
        className="fill-zinc-900 dark:fill-zinc-50"
        fontSize="14"
        fontWeight="700"
      >
        <tspan ref={numRef}>0</tspan>
      </text>
    </svg>
  );
}

const stageLabels: Record<string, string> = {
  planning: "Planning stage",
  registered: "Registered",
  "first-shipment": "First shipment",
  scaling: "Scaling exports",
};

export function WelcomeHeader() {
  const profile = useUserStore((s) => s.profile);

  const hasProfile = !!profile.businessName;

  return (
    <div className="rounded-2xl bg-linear-to-r from-orange-50 via-white to-green-50 p-6 ring-1 ring-zinc-200 dark:from-orange-950/20 dark:via-zinc-900 dark:to-green-950/20 dark:ring-zinc-800 sm:p-8">
      {hasProfile ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {getGreeting()}, {profile.businessName} 👋
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.sector && <Badge variant="orange">{profile.sector}</Badge>}
              {profile.exportStage && (
                <Badge variant="default">
                  {stageLabels[profile.exportStage] ?? profile.exportStage}
                </Badge>
              )}
            </div>
            {!profile.readinessScore && (
              <Link
                href="/dashboard/readiness"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-saffron-600 transition-colors hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300"
              >
                Take your readiness assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {typeof profile.readinessScore === "number" && (
            <MiniGauge score={profile.readinessScore} />
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Welcome to India2World
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Complete your profile for personalized export guidance and scheme recommendations.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-saffron-600"
          >
            Set up your profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
