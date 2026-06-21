"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  FileText,
  Globe2,
  Landmark,
  Shield,
} from "lucide-react";

const TIPS = [
  {
    category: "Scheme",
    icon: Landmark,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    tip: "RoDTEP refunds embedded taxes not covered by other schemes. Apply via ICEGATE after filing your shipping bill — rates range from 0.5% to 4.3% of FOB value.",
    action: "Check RoDTEP rates",
    href: "/dashboard/chat?q=What are the latest RoDTEP rates for 2025?",
  },
  {
    category: "Compliance",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    tip: "GST LUT (Letter of Undertaking) allows you to export without paying IGST upfront. File it annually on the GST portal before your first shipment of the year.",
    action: "Learn how to file LUT",
    href: "/dashboard/chat?q=How to file GST LUT for exports?",
  },
  {
    category: "FTA",
    icon: Globe2,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    tip: "India–UAE CEPA gives zero duty on most Indian goods. Ensure your Certificate of Origin (COO) is issued by APEDA or the designated export council for your product.",
    action: "Check FTA savings",
    href: "/dashboard/fta",
  },
  {
    category: "Quick Win",
    icon: Zap,
    color: "text-saffron-500",
    bg: "bg-saffron-100 dark:bg-saffron-900/30",
    tip: "EPCG licence lets you import capital goods at 0% customs duty, in exchange for an export obligation of 6× the duty saved. Great for manufacturers scaling up.",
    action: "Explore EPCG scheme",
    href: "/dashboard/schemes",
  },
  {
    category: "Compliance",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    tip: "Always verify HS codes for your product before filing. A wrong 8-digit HS code can attract misdeclaration penalties under Section 111 of the Customs Act.",
    action: "Find your HS code",
    href: "/dashboard/hs-codes",
  },
  {
    category: "Scheme",
    icon: Landmark,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    tip: "Duty Drawback rates are revised annually by CBIC every October. Check the latest schedule to maximise your drawback refund on exported goods.",
    action: "Ask AI about drawback",
    href: "/dashboard/chat?q=What are the current Duty Drawback rates?",
  },
  {
    category: "FTA",
    icon: Globe2,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    tip: "India–Australia ECTA (now ECTA) is active — preferential tariffs on 85% of Indian goods. Pharma, textiles, and engineering goods benefit most.",
    action: "Compare markets",
    href: "/dashboard/compare",
  },
  {
    category: "Quick Win",
    icon: Zap,
    color: "text-saffron-500",
    bg: "bg-saffron-100 dark:bg-saffron-900/30",
    tip: "Register your AD (Authorised Dealer) Code with your bank at the port of export — this is mandatory for filing a shipping bill on ICEGATE.",
    action: "Learn about AD Code",
    href: "/dashboard/chat?q=What is AD Code and how to register it?",
  },
  {
    category: "Compliance",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    tip: "APEDA registration is mandatory for exporting agricultural and processed food products. It also unlocks access to APEDA subsidy schemes.",
    action: "View doc checklist",
    href: "/dashboard/checklist",
  },
  {
    category: "Quick Win",
    icon: Zap,
    color: "text-saffron-500",
    bg: "bg-saffron-100 dark:bg-saffron-900/30",
    tip: "Use the DGFT IEC Modification portal to update your IEC profile. An outdated IEC with wrong bank details causes shipping bill rejections.",
    action: "Ask about IEC",
    href: "/dashboard/chat?q=How to update or modify IEC on DGFT portal?",
  },
];

function getDailyIndex(): number {
  const today = new Date();
  const dayOfYear =
    Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86_400_000
    );
  return dayOfYear % TIPS.length;
}

export function DailyTip() {
  const [idx, setIdx] = useState(getDailyIndex);
  const [animating, setAnimating] = useState(false);

  function goTo(next: number) {
    setAnimating(true);
    setTimeout(() => {
      setIdx(next);
      setAnimating(false);
    }, 180);
  }

  const tip = TIPS[idx];
  const Icon = tip.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Top accent strip */}
      <div className="h-0.5 w-full bg-linear-to-r from-saffron-400 via-orange-400 to-india-green-500" />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2.5">
          <Lightbulb className="h-4 w-4 text-saffron-500 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex-1">
            Daily Export Tip
          </span>
          {/* category badge */}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${tip.bg}`}>
            <Icon className={`h-3 w-3 shrink-0 ${tip.color}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tip.color}`}>
              {tip.category}
            </span>
          </div>
        </div>

        {/* Tip text */}
        <p
          className={`text-sm leading-6 text-zinc-700 dark:text-zinc-300 transition-all duration-180 ${
            animating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          }`}
        >
          {tip.tip}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={tip.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 transition-colors"
          >
            {tip.action}
            <ArrowRight className="h-3 w-3" />
          </Link>

          {/* nav controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo((idx - 1 + TIPS.length) % TIPS.length)}
              aria-label="Previous tip"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[28px] text-center text-[10px] tabular-nums text-zinc-400">
              {idx + 1}/{TIPS.length}
            </span>
            <button
              type="button"
              onClick={() => goTo((idx + 1) % TIPS.length)}
              aria-label="Next tip"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
