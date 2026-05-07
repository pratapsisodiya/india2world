"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Target,
  Wand2,
  FileText,
  Globe2,
  Hash,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Globe } from "@/components/ui/Globe";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    href: "/dashboard/chat",
    icon: MessageSquare,
    label: "AI Export Chat",
    desc: "Ask anything — procedures, HS codes, target markets, govt schemes. Instant answers powered by Claude.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "hover:border-orange-500/30",
  },
  {
    href: "/dashboard/schemes/wizard",
    icon: Wand2,
    label: "Scheme Finder",
    desc: "Answer 5 questions. Get matched to RoDTEP, EPCG, MEIS, duty drawback schemes you can actually claim.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/30",
  },
  {
    href: "/dashboard/hs-codes",
    icon: Hash,
    label: "HS Code Lookup",
    desc: "Search 500+ ITC-HS codes by product name or keyword. Know your classification before filing.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "hover:border-purple-500/30",
  },
  {
    href: "/dashboard/fta",
    icon: Globe2,
    label: "FTA Calculator",
    desc: "Calculate preferential duty savings under CEPA, SAFTA, and bilateral FTAs. Know your tariff advantage.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "hover:border-blue-500/30",
  },
  {
    href: "/dashboard/readiness",
    icon: Target,
    label: "Readiness Score",
    desc: "Take the 6-question export readiness assessment. Get a personalised gap analysis and action plan.",
    color: "text-saffron-400",
    bg: "bg-saffron-500/10",
    border: "hover:border-saffron-500/30",
  },
  {
    href: "/dashboard/checklist",
    icon: FileText,
    label: "Document Checklist",
    desc: "Know exactly which documents you need for each product and destination before your first shipment.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "hover:border-rose-500/30",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Target,
    title: "Assess Your Readiness",
    desc: "Take the 6-question export readiness assessment. Get a score and personalised action plan in under 6 minutes.",
    time: "6 min",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Find Matching Schemes",
    desc: "Answer 5 questions and get matched to RoDTEP, EPCG, and other incentives you can actually claim.",
    time: "5 min",
  },
  {
    num: "03",
    icon: Hash,
    title: "Verify HS Codes",
    desc: "Search and verify ITC-HS codes for your product. Correct classification means correct duty rates.",
    time: "2 min",
  },
  {
    num: "04",
    icon: Globe2,
    title: "Calculate FTA Savings",
    desc: "Calculate preferential duty savings under CEPA, ECTA, and bilateral FTAs. Know your tariff advantage.",
    time: "3 min",
  },
  {
    num: "05",
    icon: FileText,
    title: "Generate Checklist",
    desc: "Get a tailored document checklist — Invoice, BL, COO, FSSAI — for your product and destination.",
    time: "instant",
  },
  {
    num: "06",
    icon: TrendingUp,
    title: "Start Your First Shipment",
    desc: "With your readiness score, schemes, codes, and docs in place — you're ready to ship with confidence.",
    time: "you're ready!",
  },
];

const WHAT_YOU_BUILD = [
  { label: "Export readiness profile", desc: "Know your gaps and next steps" },
  { label: "Market intelligence dashboard", desc: "Target markets, FTA status, and tariffs" },
  { label: "Scheme eligibility records", desc: "Matched incentives with claim steps" },
  { label: "Compliance checklist", desc: "All docs for your product and market" },
  { label: "Saved country profiles", desc: "Compare and track your target markets" },
];

const SECTORS = [
  { emoji: "🧵", name: "Textiles & Apparel", hook: "RoSCTL, RCMC, buyer sourcing" },
  { emoji: "🌶️", name: "Spices & Agriculture", hook: "Spices Board, APEDA, phytosanitary" },
  { emoji: "💊", name: "Pharmaceuticals", hook: "CDSCO NOC, WHO-GMP, MRA markets" },
  { emoji: "💎", name: "Gems & Jewellery", hook: "GJEPC, duty drawback, UAE exports" },
  { emoji: "⚙️", name: "Engineering Goods", hook: "EPCG, BIS, EEPC membership" },
  { emoji: "☕", name: "Tea & Coffee", hook: "Tea Board, Coffee Board, GI tags" },
  { emoji: "👜", name: "Leather & Footwear", hook: "CLE, FDDI, EU compliance" },
  { emoji: "💻", name: "IT & Software", hook: "SEIS, SEZ, service exports" },
];

const FAQS = [
  {
    q: "Is India2World free to use?",
    a: "Yes — core tools including AI Chat, HS Code Lookup, Scheme Finder, and Document Checklist are completely free. We plan to keep the essentials free for Indian SME exporters.",
  },
  {
    q: "Do I need an IEC number to use this platform?",
    a: "No IEC is needed to use India2World. However, you will need an Import Export Code (IEC) from DGFT to actually export goods from India. Our AI can walk you through the IEC application process.",
  },
  {
    q: "How accurate is the AI guidance?",
    a: "Our AI is trained on official DGFT, CBIC, APEDA, and Spices Board data and updated regularly. For critical decisions — final duty rates, scheme eligibility, and compliance filings — always verify with DGFT or a licensed customs broker.",
  },
  {
    q: "Which export sectors does India2World support?",
    a: "We cover 8 major sectors: Textiles & Apparel, Spices & Agriculture, Pharmaceuticals, Gems & Jewellery, Engineering Goods, Tea & Coffee, Leather & Footwear, and IT/Software services. Each sector has tailored AI guidance.",
  },
  {
    q: "What is RoDTEP and can any exporter claim it?",
    a: "RoDTEP (Remission of Duties and Taxes on Exported Products) refunds embedded taxes on exports that aren't rebated elsewhere. Most goods exporters with a valid IEC and shipping bill are eligible. Our Scheme Finder will tell you your exact rate.",
  },
  {
    q: "Can I use India2World for services exports (IT/ITES)?",
    a: "Yes. We cover SEIS (Service Exports from India Scheme), SEZ benefits for IT companies, and RBI FEMA compliance for service exporters. Ask the AI about 'SEIS eligibility' to get started.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col">

      {/* ── Tricolor stripe ──────────────────────────────────────────────── */}
      <div
        className="h-0.75 w-full shrink-0"
        style={{
          background:
            "linear-gradient(to right, #FF9933 33.333%, #ffffff 33.333% 66.666%, #138808 66.666%)",
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-zinc-950">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-150 w-150 rounded-full bg-saffron-500/8 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-125 w-125 rounded-full bg-india-green-500/6 blur-[110px]" />
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Left — copy */}
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="order-2 flex flex-col gap-7 lg:order-1"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-saffron-500/30 bg-saffron-500/10 px-3.5 py-1.5 text-xs font-semibold text-saffron-400 backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Powered by Claude AI
              </motion.div>

              {/* Headline */}
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Take India<br />
                <span className="bg-linear-to-r from-saffron-400 via-orange-400 to-saffron-500 bg-clip-text text-transparent">
                  to the World
                </span>
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
                AI-powered export guidance for Indian businesses — IEC registration,
                scheme matching, HS codes, FTA savings, and compliance. All in one place.
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/chat"
                  className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-saffron-500 to-orange-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-saffron-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-saffron-500/35"
                >
                  Start Exporting Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-7 py-3.5 text-base font-semibold text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-500">
                {["No credit card", "Free to start", "Instant answers"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-india-green-500" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
              className="order-1 relative flex justify-center lg:order-2"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-80 w-80 rounded-full bg-saffron-500/5 blur-[70px]" />
              </div>
              <div className="relative z-10 w-full max-w-115">
                <Globe />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-800 bg-zinc-900/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-10 text-center lg:grid-cols-4"
          >
            {[
              { target: 200, suffix: "+", label: "Export Schemes", sub: "GOI incentive programs" },
              { target: 160, suffix: "+", label: "Countries Covered", sub: "Global market reach" },
              { target: 60, suffix: "+", label: "Glossary Terms", sub: "Plain-language definitions" },
              { target: 8, suffix: "", label: "Export Sectors", sub: "Tailored AI guidance" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="bg-linear-to-br from-saffron-400 to-orange-500 bg-clip-text text-4xl font-extrabold tabular-nums text-transparent sm:text-5xl">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="text-sm font-semibold text-zinc-200">{stat.label}</p>
                <p className="hidden text-xs text-zinc-500 sm:block">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-saffron-500">
              Platform
            </span>
            <h2 className="mb-5 text-4xl font-extrabold text-white sm:text-5xl">
              Every Tool You Need to Export
            </h2>
            <p className="mx-auto max-w-xl text-lg text-zinc-400">
              Six integrated tools covering every stage — from your first IEC to scaling across markets.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.href} variants={cardVariants}>
                  <Link
                    href={f.href}
                    className={`gradient-border group flex h-full flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-7 transition-all duration-200 ${f.border} hover:bg-zinc-900/80`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <div>
                      <p className="mb-1.5 text-base font-bold text-zinc-100">{f.label}</p>
                      <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-zinc-600 transition-colors group-hover:text-saffron-400">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Your Export Journey (How it works) ──────────────────────────── */}
      <section id="how-it-works" className="relative overflow-hidden bg-zinc-900 py-24">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-saffron-500/3 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-saffron-500">
              Your Export Journey
            </span>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              From Zero to First Shipment
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Six steps. Each one takes minutes. Together, they make you export-ready.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
                      <Icon className="h-5 w-5 text-saffron-400" />
                    </div>
                    <span className="rounded-full bg-saffron-500/15 px-2.5 py-0.5 text-[10px] font-bold text-saffron-400">
                      {step.time}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                  </div>
                  <span className="pointer-events-none absolute right-4 top-4 select-none text-4xl font-black text-saffron-500/5">
                    {step.num}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* CTAs under journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/dashboard/readiness"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-saffron-500 to-orange-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-saffron-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              Start Exporting Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/schemes/wizard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-7 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:border-zinc-400 hover:bg-zinc-800"
            >
              See Your Schemes
            </Link>
            <Link
              href="/dashboard/countries"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-7 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:border-zinc-400 hover:bg-zinc-800"
            >
              Explore Markets
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── What You'll Build ──────────────────────────────────────────── */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-saffron-500">
              Your Workspace
            </span>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              What You&apos;ll Build
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              India2World isn&apos;t a chatbot — it&apos;s an export workspace you fill with intelligence specific to your business.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto grid max-w-3xl gap-3"
          >
            {WHAT_YOU_BUILD.map((item, i) => (
              <motion.div
                key={item.label}
                variants={cardVariants}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-india-green-500/20 text-sm font-bold text-india-green-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sectors showcase ─────────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-saffron-500">
              Sectors
            </span>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Built for Every Indian Exporter
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Sector-specific AI guidance, scheme matching, and compliance checklists.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {SECTORS.map((sector) => (
              <motion.div
                key={sector.name}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href={`/dashboard/chat?q=Export guidance for ${encodeURIComponent(sector.name)} from India`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center transition-all duration-200 hover:border-saffron-500/30 hover:bg-zinc-800/80 sm:p-6"
                >
                  <span className="text-4xl">{sector.emoji}</span>
                  <p className="text-sm font-bold text-zinc-100">{sector.name}</p>
                  <p className="hidden text-xs leading-tight text-zinc-500 sm:block">{sector.hook}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-saffron-400" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-saffron-500">
              FAQ
            </span>
            <h2 className="text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="divide-y divide-zinc-800">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-white transition-colors hover:text-saffron-400"
                >
                  <span>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-zinc-500" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(135deg, #FF9933 0%, #f97316 45%, #138808 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 text-center sm:px-6"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Start Exporting Today
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80">
              Join Indian exporters using AI to navigate compliance, unlock schemes, and ship with confidence.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-saffron-600 shadow-xl shadow-black/20 transition-all hover:scale-[1.02] hover:bg-saffron-50"
            >
              Start Exporting Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/60 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/60">
            <Zap className="h-3.5 w-3.5" />
            Free forever for core tools. No credit card required.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
