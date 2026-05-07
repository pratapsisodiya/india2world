"use client";

import Link from "next/link";
import {
  Target,
  Settings,
  Globe2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useUserStore } from "@/store/user";

interface Step {
  title: string;
  description: string;
  href: string;
  icon: typeof Target;
  primary?: boolean;
}

function deriveSteps(profile: {
  readinessScore?: number;
  sector: string;
  targetMarkets: string[];
  businessName: string;
}): Step[] {
  const steps: Step[] = [];

  if (typeof profile.readinessScore !== "number") {
    steps.push({
      title: "Take your readiness assessment",
      description: "Answer 6 quick questions to get a personalized export readiness score and AI action plan.",
      href: "/dashboard/readiness",
      icon: Target,
      primary: true,
    });
  }

  if (!profile.businessName || !profile.sector) {
    steps.push({
      title: "Complete your business profile",
      description: "Set your sector, products, and target markets to unlock personalized recommendations.",
      href: "/settings",
      icon: Settings,
    });
  }

  if (profile.targetMarkets.length === 0) {
    steps.push({
      title: "Choose your target markets",
      description: "Select export destinations to see FTA duty savings and required certifications.",
      href: "/settings",
      icon: Globe2,
    });
  }

  steps.push({
    title: "Generate a document checklist",
    description: "Get a complete list of export documents needed for any product and destination.",
    href: "/dashboard/checklist",
    icon: FileText,
  });

  return steps.slice(0, 3);
}

export function NextSteps() {
  const profile = useUserStore((s) => s.profile);
  const steps = deriveSteps(profile);

  if (steps.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Your next steps
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.href + step.title}
              href={step.href}
              className={`group flex flex-col rounded-xl p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                step.primary
                  ? "bg-saffron-50 ring-saffron-200 hover:ring-saffron-300 dark:bg-saffron-500/10 dark:ring-saffron-500/20 dark:hover:ring-saffron-500/40"
                  : "bg-white ring-zinc-200 hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
              }`}
            >
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                step.primary
                  ? "bg-saffron-100 text-saffron-600 dark:bg-saffron-900/40 dark:text-saffron-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="mt-1 flex-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-saffron-600 dark:text-saffron-400">
                Get started
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
