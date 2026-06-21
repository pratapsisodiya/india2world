"use client";

import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  Landmark,
  Hash,
  ArrowRight,
  Target,
  Wand2,
  FileText,
  Globe2,
  TrendingUp,
  ShieldCheck,
  Zap,
  PackageCheck,
  Scale,
  DollarSign,
  Bookmark,
  Sparkles,
  Newspaper,
  CheckCircle2,
  Circle,
  ChevronRight,
  Lightbulb,
  Package,
  Truck,
  MapPin,
  BarChart3,
  Mail,
  Ship,
  Banknote,
} from "lucide-react";

import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { NextSteps } from "@/components/dashboard/NextSteps";
import { SectorInsight } from "@/components/dashboard/SectorInsight";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ExportTipBanner } from "@/components/dashboard/ExportTipBanner";
import { DailyTip } from "@/components/dashboard/DailyTip";
import { useUserStore } from "@/store/user";
import { useActivityStore } from "@/store/activity";
import { useChatStore } from "@/store/chat";

const quickActions = [
  {
    title: "Research Agent",
    description: "AI agent with live web search — latest DGFT notifications, FTA updates, and news with sources.",
    href: "/dashboard/research",
    icon: Sparkles,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
    highlight: true,
  },
  {
    title: "Live News Feed",
    description: "Latest export news, scheme updates, and customs notifications — refreshed automatically.",
    href: "/dashboard/updates",
    icon: Newspaper,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
    highlight: true,
  },
  {
    title: "Export Readiness Score",
    description: "6 questions to find out how ready you are — with a personalised AI action plan.",
    href: "/dashboard/readiness",
    icon: Target,
    color: "bg-saffron-100 text-saffron-600 dark:bg-saffron-900/40 dark:text-saffron-400",
    highlight: true,
  },
  {
    title: "Find My Schemes",
    description: "Get matched to government schemes you qualify for, with claim steps.",
    href: "/dashboard/schemes/wizard",
    icon: Wand2,
    color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    highlight: true,
  },
  {
    title: "Document Checklist",
    description: "Generate a complete export doc checklist for any product + country.",
    href: "/dashboard/checklist",
    icon: FileText,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    highlight: true,
  },
  {
    title: "FTA Tariff Advantage",
    description: "Calculate FTA duty savings and get Certificate of Origin guidance.",
    href: "/dashboard/fta",
    icon: Globe2,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    highlight: true,
  },
  {
    title: "Start a conversation",
    description: "Ask the AI agent about export procedures, markets, and schemes.",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
  },
  {
    title: "Government schemes",
    description: "Browse all incentives: RoDTEP, EPCG, Duty Drawback, and more.",
    href: "/dashboard/schemes",
    icon: Landmark,
    color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
  },
  {
    title: "Export glossary",
    description: "Browse 60+ export-related terms and definitions.",
    href: "/dashboard/glossary",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    title: "HS code lookup",
    description: "Find the right ITC-HS classification for your products.",
    href: "/dashboard/hs-codes",
    icon: Hash,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  },
  {
    title: "Market Comparison",
    description: "Compare two export markets side by side — tariffs, FTA status, regulations, and more.",
    href: "/dashboard/compare",
    icon: Scale,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  },
  {
    title: "Pricing Calculator",
    description: "Calculate FOB, CFR, and CIF prices with your margin — in INR and foreign currency.",
    href: "/dashboard/pricing",
    icon: DollarSign,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  {
    title: "Country Profiles",
    description: "Key export data for India's top 20 markets — FTA status, tariffs, and payment norms.",
    href: "/dashboard/countries",
    icon: Globe2,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",
  },
  {
    title: "Saved Items",
    description: "All your bookmarked government schemes and glossary terms in one place.",
    href: "/dashboard/saved",
    icon: Bookmark,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
  {
    title: "Landed Cost Calculator",
    description: "Calculate your buyer's total landed cost including import duties, GST/VAT, and local charges.",
    href: "/dashboard/landed-cost",
    icon: Package,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
    highlight: true,
  },
  {
    title: "Buyer Outreach Templates",
    description: "AI-generated cold emails, quotation letters, and follow-up sequences for international buyers.",
    href: "/dashboard/outreach",
    icon: Mail,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
    highlight: true,
  },
  {
    title: "Export Finance Hub",
    description: "Explore ECGC insurance, pre/post-shipment credit calculators, and EXIM Bank schemes.",
    href: "/dashboard/finance",
    icon: Banknote,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    highlight: true,
  },
  {
    title: "Shipment Process Guide",
    description: "Step-by-step walkthrough from PO to payment realization — sea, air, and courier.",
    href: "/dashboard/shipment-guide",
    icon: Ship,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    highlight: true,
  },
];

// ─── Trending Searches ───────────────────────────────────────────────────────

const TRENDING = [
  { label: "RoDTEP rates 2025", q: "What are the latest RoDTEP rates for 2025?" },
  { label: "India-UK FTA update", q: "What is the latest status of India-UK FTA negotiations?" },
  { label: "EPCG eligibility", q: "Who is eligible for EPCG scheme in India?" },
  { label: "HS code for spices", q: "What is the HS code for spices export from India?" },
  { label: "GST LUT filing", q: "How to file GST LUT for exports in 2025?" },
  { label: "AD Code registration", q: "How to register AD code with bank for export?" },
  { label: "DGFT IEC update", q: "How to update IEC on DGFT portal?" },
  { label: "UAE CEPA benefits", q: "What are the benefits of India-UAE CEPA for exporters?" },
];

function TrendingSearches() {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        🔥 Trending
      </span>
      <div className="flex flex-1 gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {TRENDING.map((t) => (
          <Link
            key={t.label}
            href={`/dashboard/chat?q=${encodeURIComponent(t.q)}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:ring-saffron-300 hover:text-saffron-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:ring-saffron-500/40 dark:hover:text-saffron-400"
          >
            <span className="text-[10px]">🔍</span>
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const sectors = [
  { emoji: "🧵", title: "Textiles & apparel" },
  { emoji: "🎨", title: "Handicrafts" },
  { emoji: "🌶️", title: "Spices & agri" },
  { emoji: "💎", title: "Gems & jewellery" },
  { emoji: "⚙️", title: "Engineering goods" },
  { emoji: "💊", title: "Pharma & life sciences" },
  { emoji: "💻", title: "IT & ITES services" },
  { emoji: "👜", title: "Leather & footwear" },
];

const marketPulse = [
  { flag: "🇦🇪", market: "UAE", note: "Zero duty on most Indian goods under CEPA" },
  { flag: "🇺🇸", market: "USA", note: "GSP suspended — check HTS carefully" },
  { flag: "🇬🇧", market: "UK", note: "India–UK FTA negotiations ongoing" },
  { flag: "🇸🇬", market: "Singapore", note: "CECA grants preferential tariffs" },
  { flag: "🇦🇺", market: "Australia", note: "ECTA in force — reduced pharma duties" },
];

const whyCards = [
  {
    icon: ShieldCheck,
    title: "DGFT & CBIC aligned",
    desc: "Guidance follows latest circulars from DGFT, CBIC, and APEDA.",
    color: "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400",
  },
  {
    icon: Zap,
    title: "Instant AI answers",
    desc: "No waiting — get export procedures, HS codes, and scheme eligibility in seconds.",
    color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/30 text-yellow-400",
  },
  {
    icon: TrendingUp,
    title: "FTA duty savings",
    desc: "Calculate real savings from India's 14 active Free Trade Agreements.",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
  },
  {
    icon: PackageCheck,
    title: "Document-ready",
    desc: "Generate tailored checklists: Invoice, BL, COO, FSSAI, and more.",
    color: "from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400",
  },
];

// Stage-specific next best actions
const STAGE_ACTIONS: Record<string, { label: string; href: string; desc: string; icon: typeof Target }[]> = {
  planning: [
    { label: "Get your IEC code", href: "/dashboard/chat?q=How do I apply for IEC code from DGFT?", desc: "Start exporting legally", icon: FileText },
    { label: "Check readiness score", href: "/dashboard/readiness", desc: "Know your gaps", icon: Target },
    { label: "Find your HS code", href: "/dashboard/hs-codes", desc: "Classify your product", icon: Hash },
  ],
  registered: [
    { label: "Match to schemes", href: "/dashboard/schemes/wizard", desc: "Find your incentives", icon: Wand2 },
    { label: "Document checklist", href: "/dashboard/checklist", desc: "Prepare your docs", icon: FileText },
    { label: "Compare markets", href: "/dashboard/compare", desc: "Choose your first market", icon: Scale },
  ],
  "first-shipment": [
    { label: "FTA duty savings", href: "/dashboard/fta", desc: "Cut your tariff bill", icon: Globe2 },
    { label: "Price your product", href: "/dashboard/pricing", desc: "FOB, CFR, CIF pricing", icon: DollarSign },
    { label: "Research market", href: "/dashboard/research", desc: "Live intelligence", icon: Sparkles },
  ],
  scaling: [
    { label: "New country profiles", href: "/dashboard/countries", desc: "Expand your footprint", icon: Globe2 },
    { label: "Market comparison", href: "/dashboard/compare", desc: "Find next best market", icon: BarChart3 },
    { label: "Latest news", href: "/dashboard/updates", desc: "Stay ahead of policy", icon: Newspaper },
  ],
};

const EXPORT_PIPELINE_STAGES = [
  { id: "planning", label: "Planning", icon: Lightbulb, desc: "Research & readiness" },
  { id: "registered", label: "Registered", icon: FileText, desc: "IEC, RCMC, GST LUT" },
  { id: "first-shipment", label: "First Shipment", icon: Package, desc: "Docs, schemes, pricing" },
  { id: "scaling", label: "Scaling", icon: Truck, desc: "New markets & FTAs" },
];

const COMPLIANCE_ITEMS = [
  { label: "Import Export Code (IEC)", href: "/dashboard/chat?q=How to apply for IEC code?" },
  { label: "GST Registration & LUT", href: "/dashboard/chat?q=What is GST LUT for exports?" },
  { label: "RCMC from Export Council", href: "/dashboard/chat?q=How to get RCMC for exports?" },
  { label: "Shipping Bill on ICEGATE", href: "/dashboard/chat?q=How to file shipping bill on ICEGATE?" },
  { label: "AD Code Registration", href: "/dashboard/chat?q=What is AD code and how to get it?" },
];

function NextBestAction() {
  const profile = useUserStore((s) => s.profile);
  const stage = profile.exportStage || "planning";
  const actions = STAGE_ACTIONS[stage] ?? STAGE_ACTIONS.planning;

  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-800 ring-1 ring-zinc-700/50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-700/50 px-5 py-3">
        <Lightbulb className="h-4 w-4 text-saffron-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Next best action
        </span>
        {profile.exportStage && (
          <span className="ml-auto rounded-full bg-saffron-500/20 px-2 py-0.5 text-[10px] font-semibold text-saffron-300">
            {profile.exportStage}
          </span>
        )}
      </div>
      <div className="grid divide-y divide-zinc-700/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-zinc-700/30"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-saffron-500/15">
                <Icon className="h-4 w-4 text-saffron-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-100 group-hover:text-saffron-300 transition-colors">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{action.desc}</p>
              </div>
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-saffron-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Stage unlock hints — what to do to advance
const STAGE_UNLOCK_HINTS: Record<string, { hint: string; href: string }[]> = {
  planning: [
    { hint: "Get your IEC code from DGFT", href: "/dashboard/chat?q=How to apply for IEC code?" },
    { hint: "Complete export readiness score", href: "/dashboard/readiness" },
  ],
  registered: [
    { hint: "Match your first government scheme", href: "/dashboard/schemes/wizard" },
    { hint: "Generate your document checklist", href: "/dashboard/checklist" },
  ],
  "first-shipment": [
    { hint: "Calculate FTA duty savings", href: "/dashboard/fta" },
    { hint: "Research your target market", href: "/dashboard/research" },
  ],
  scaling: [
    { hint: "Explore new country profiles", href: "/dashboard/countries" },
    { hint: "Compare two markets side-by-side", href: "/dashboard/compare" },
  ],
};

function ExportPipeline() {
  const profile = useUserStore((s) => s.profile);
  const currentStageIndex = EXPORT_PIPELINE_STAGES.findIndex(
    (s) => s.id === profile.exportStage
  );
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
  const progressPct = Math.round((activeIndex / (EXPORT_PIPELINE_STAGES.length - 1)) * 100);
  const currentStageId = EXPORT_PIPELINE_STAGES[activeIndex]?.id ?? "planning";
  const hints = STAGE_UNLOCK_HINTS[currentStageId] ?? [];

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <Truck className="h-4 w-4 text-saffron-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Export journey
        </span>
        <span className="ml-auto text-[10px] font-semibold text-saffron-600 dark:text-saffron-400">
          {progressPct}% complete
        </span>
        <Link
          href="/dashboard/settings"
          className="text-[10px] font-medium text-zinc-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
        >
          Update →
        </Link>
      </div>

      {/* Animated progress bar */}
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-linear-to-r from-saffron-400 to-india-green-500 transition-all duration-1000 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-start gap-0 p-4 sm:p-5 overflow-x-auto">
        {EXPORT_PIPELINE_STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;

          return (
            <div key={stage.id} className="flex flex-1 items-start min-w-0">
              <div className="flex flex-col items-center gap-2 flex-1 text-center px-1">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 transition-all ${
                  isCompleted
                    ? "bg-india-green-500 ring-india-green-200 dark:ring-india-green-900"
                    : isActive
                    ? "bg-saffron-500 ring-saffron-200 dark:ring-saffron-900 shadow-[0_0_16px_rgba(255,153,51,0.4)]"
                    : "bg-zinc-100 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400 dark:text-zinc-500"}`} />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${
                    isActive ? "text-saffron-600 dark:text-saffron-400" :
                    isCompleted ? "text-india-green-600 dark:text-india-green-400" :
                    "text-zinc-500 dark:text-zinc-500"
                  }`}>
                    {stage.label}
                  </p>
                  <p className="hidden text-[10px] text-zinc-400 sm:block">{stage.desc}</p>
                </div>
              </div>
              {i < EXPORT_PIPELINE_STAGES.length - 1 && (
                <div className={`mt-4 h-0.5 flex-1 self-start transition-all duration-700 ${
                  i < activeIndex
                    ? "bg-linear-to-r from-india-green-400 to-india-green-300"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage unlock hints */}
      {hints.length > 0 && (
        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            To advance to next stage:
          </p>
          <div className="flex flex-col gap-1.5">
            {hints.map((h) => (
              <Link
                key={h.hint}
                href={h.href}
                className="group flex items-center gap-2 text-xs text-zinc-600 hover:text-saffron-600 dark:text-zinc-400 dark:hover:text-saffron-400 transition-colors"
              >
                <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 group-hover:text-saffron-400 transition-colors" />
                {h.hint}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceTracker() {
  const profile = useUserStore((s) => s.profile);
  // Count completed items based on actual profile state
  let completed = 0;
  if (profile.hasIEC) completed++; // IEC
  if (profile.sector) completed++; // GST (assumed with sector)
  if (profile.exportStage && profile.exportStage !== "planning") completed++; // RCMC (assumed if past planning)
  if (profile.exportStage === "scaling") completed++; // Shipping Bill (assumed if scaling)
  if (profile.isoVerified) completed++; // AD Code (ISO as proxy)

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <ShieldCheck className="h-4 w-4 text-saffron-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Compliance checklist
        </span>
        <span className="ml-auto text-[10px] font-semibold text-zinc-400">
          {completed}/{COMPLIANCE_ITEMS.length} done
        </span>
      </div>
      <div className="p-4">
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-saffron-500 transition-all duration-700"
            style={{ width: `${(completed / COMPLIANCE_ITEMS.length) * 100}%` }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {COMPLIANCE_ITEMS.map((item, i) => {
            const done = i < completed;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-india-green-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}
                <span className={`flex-1 text-sm ${done ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {item.label}
                </span>
                {!done && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
                )}
              </Link>
            );
          })}
        </div>
        <Link
          href="/dashboard/readiness"
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 transition-colors"
        >
          <Target className="h-3.5 w-3.5" />
          Take readiness assessment to update
        </Link>
      </div>
    </div>
  );
}

function MarketOpportunitySnapshot() {
  const profile = useUserStore((s) => s.profile);

  const opportunities = [
    {
      market: "UAE",
      flag: "🇦🇪",
      why: "CEPA in force — zero duty on most goods",
      fit: profile.sector ? `Strong demand for ${profile.sector.toLowerCase()}` : "High import volumes",
      ftaBadge: "CEPA",
    },
    {
      market: "UK",
      flag: "🇬🇧",
      why: "FTA negotiations near completion",
      fit: "Access to 68M consumers",
      ftaBadge: "Upcoming FTA",
    },
    {
      market: "Australia",
      flag: "🇦🇺",
      why: "ECTA active — preferential tariffs",
      fit: "Growing demand for Indian products",
      ftaBadge: "ECTA",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <MapPin className="h-4 w-4 text-saffron-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Market opportunities
        </span>
        <Link
          href="/dashboard/compare"
          className="ml-auto text-[10px] font-medium text-zinc-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
        >
          Compare →
        </Link>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {opportunities.map((opp) => (
          <Link
            key={opp.market}
            href={`/dashboard/chat?q=${encodeURIComponent(`Tell me about exporting to ${opp.market} from India`)}`}
            className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          >
            <span className="text-2xl">{opp.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{opp.market}</p>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                  {opp.ftaBadge}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{opp.why}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-saffron-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function MilestonesPanel() {
  const milestones = useActivityStore((s) => s.milestones);
  const completeMilestone = useActivityStore((s) => s.completeMilestone);
  const completed = milestones.filter((m) => m.completedAt);

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <CheckCircle2 className="h-4 w-4 text-saffron-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Export milestones
        </span>
        <span className="ml-auto text-[10px] font-semibold text-zinc-400">
          {completed.length}/{milestones.length}
        </span>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {milestones.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => !m.completedAt && completeMilestone(m.id)}
            className="group flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          >
            {m.completedAt ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-india-green-500" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-saffron-400 dark:text-zinc-600 transition-colors" />
            )}
            <span className={`flex-1 text-sm ${m.completedAt ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}>
              {m.label}
            </span>
            {m.completedAt && (
              <span className="shrink-0 text-[10px] text-zinc-400">
                {new Date(m.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const chatMessages = useChatStore((s) => s.messages);
  const hasChatHistory = chatMessages.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

        {/* Welcome */}
        <WelcomeHeader />

        {/* Quick stats */}
        <div className="mt-6">
          <QuickStats />
        </div>

        {/* Trending Searches */}
        <div className="mt-5">
          <TrendingSearches />
        </div>

        {/* Export tip banner + Daily Tip in a 2-col grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ExportTipBanner />
          <DailyTip />
        </div>

        {/* Next best action — context-aware */}
        <div className="mt-8">
          <NextBestAction />
        </div>

        {/* Export journey pipeline */}
        <div className="mt-6">
          <ExportPipeline />
        </div>

        {/* Market pulse strip */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
            <TrendingUp className="h-4 w-4 text-saffron-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Market pulse
            </span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {marketPulse.map((m) => (
              <div key={m.market} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                <span className="text-xl">{m.flag}</span>
                <span className="w-20 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{m.market}</span>
                <span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">{m.note}</span>
                <Link
                  href={`/dashboard/chat?q=${encodeURIComponent(`Tell me about exporting to ${m.market} from India`)}`}
                  className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-saffron-100 hover:text-saffron-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-saffron-900/30 dark:hover:text-saffron-400"
                >
                  Ask AI
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence grid: compliance + market opportunities */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ComplianceTracker />
          <MarketOpportunitySnapshot />
        </div>

        {/* Milestones + next steps */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <MilestonesPanel />
          <div className="flex flex-col gap-6">
            <NextSteps />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-saffron-500 px-2 py-0.5 text-[10px] font-semibold text-white">NEW</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">All tools</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${
                    "highlight" in action && action.highlight
                      ? "ring-saffron-200 hover:ring-saffron-300 dark:ring-saffron-500/20 dark:hover:ring-saffron-500/40"
                      : "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-800 dark:hover:ring-zinc-700"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Why India2World */}
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Why India2World
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyCards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className={`rounded-2xl border bg-linear-to-br p-5 ${c.color}`}
                >
                  <Icon className="mb-3 h-5 w-5" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector insight */}
        <div className="mt-10">
          <SectorInsight />
        </div>

        {/* Export sectors */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Export sectors
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sectors.map((s) => (
              <Link
                key={s.title}
                href={`/dashboard/chat?q=${encodeURIComponent(`I want to export ${s.title.toLowerCase()} from India. What do I need to know?`)}`}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-10">
          <RecentActivity />
        </div>

        {/* Resume chat CTA — shows only when there's existing history */}
        {hasChatHistory && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-saffron-200 bg-saffron-50 p-6 dark:border-saffron-500/20 dark:bg-saffron-500/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-saffron-800 dark:text-saffron-300">
                  Resume your last conversation
                </p>
                <p className="mt-0.5 text-xs text-saffron-700/70 dark:text-saffron-400/70">
                  You have {chatMessages.length} message{chatMessages.length !== 1 ? "s" : ""} in your current chat session.
                </p>
              </div>
              <Link
                href="/dashboard/chat"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-saffron-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:shadow"
              >
                <MessageSquare className="h-4 w-4" />
                Continue chat
              </Link>
            </div>
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-linear-to-r from-saffron-600 via-orange-500 to-green-600 p-8 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Ready to take your product global?
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Get instant AI guidance on procedures, duties, documents, and schemes — tailored to your product and target market.
              </p>
            </div>
            <Link
              href="/dashboard/chat"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 shadow transition-transform hover:scale-[1.02] hover:shadow-md"
            >
              Ask the AI agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
