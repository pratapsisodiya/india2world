"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface WizardShellProps {
  steps: string[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  canProceed: boolean;
  loading?: boolean;
  completionLabel?: string;
  children: React.ReactNode;
}

export function WizardShell({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  canProceed,
  loading = false,
  completionLabel = "Submit",
  children,
}: WizardShellProps) {
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Step progress */}
      <div className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < currentStep
                    ? "bg-saffron-500 text-white"
                    : i === currentStep
                    ? "bg-saffron-500 text-white ring-4 ring-saffron-500/20"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                )}
              >
                {i < currentStep ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    i < currentStep
                      ? "bg-saffron-500"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "hidden text-[10px] font-medium sm:block",
                i === currentStep
                  ? "text-saffron-600 dark:text-saffron-400"
                  : "text-zinc-400"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-0 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={isLast ? onComplete : onNext}
          disabled={!canProceed || loading}
          className="rounded-lg bg-saffron-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-saffron-600 disabled:opacity-50"
        >
          {loading ? "Loading…" : isLast ? completionLabel : "Next →"}
        </button>
      </div>
    </div>
  );
}
