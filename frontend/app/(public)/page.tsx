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
  Menu,
  X,
} from "lucide-react";
import { Globe } from "@/components/ui/Globe";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Footer } from "@/components/layout/Footer";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    href: "/dashboard/chat",
    icon: MessageSquare,
    label: "AI Export Chat",
    desc: "Ask anything — procedures, HS codes, target markets, govt schemes. Instant answers powered by Claude.",
    color: "text-orange-500",
    border: "hover:border-orange-500/30 group-hover:bg-orange-50/10",
  },
  {
    href: "/dashboard/schemes/wizard",
    icon: Wand2,
    label: "Scheme Finder",
    desc: "Answer 5 questions. Get matched to RoDTEP, EPCG, MEIS, duty drawback schemes you can claim.",
    color: "text-emerald-500",
    border: "hover:border-emerald-500/30 group-hover:bg-emerald-50/10",
  },
  {
    href: "/dashboard/hs-codes",
    icon: Hash,
    label: "HS Code Lookup",
    desc: "Search 500+ ITC-HS codes by product name or keyword. Know your classification before filing.",
    color: "text-purple-500",
    border: "hover:border-purple-500/30 group-hover:bg-purple-50/10",
  },
  {
    href: "/dashboard/fta",
    icon: Globe2,
    label: "FTA Calculator",
    desc: "Calculate preferential duty savings under CEPA, SAFTA, and bilateral FTAs. Know your tariff advantage.",
    color: "text-blue-500",
    border: "hover:border-blue-500/30 group-hover:bg-blue-50/10",
  },
  {
    href: "/dashboard/readiness",
    icon: Target,
    label: "Readiness Score",
    desc: "Take the 6-question export readiness assessment. Get a personalised gap analysis and action plan.",
    color: "text-amber-500",
    border: "hover:border-amber-500/30 group-hover:bg-amber-50/10",
  },
  {
    href: "/dashboard/checklist",
    icon: FileText,
    label: "Document Checklist",
    desc: "Know exactly which documents you need for each product and destination before your first shipment.",
    color: "text-rose-500",
    border: "hover:border-rose-500/30 group-hover:bg-rose-50/10",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Target,
    title: "Assess Your Readiness",
    desc: "Take the 6-question export readiness assessment. Get a score and action plan in under 6 minutes.",
    time: "6 min",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Find Matching Schemes",
    desc: "Answer 5 questions and get matched to RoDTEP, EPCG, and other incentives you can claim.",
    time: "5 min",
  },
  {
    num: "03",
    icon: Hash,
    title: "Verify HS Codes",
    desc: "Search and verify ITC-HS codes for your product. Correct classification ensures correct duty rates.",
    time: "2 min",
  },
  {
    num: "04",
    icon: Globe2,
    title: "Calculate FTA Savings",
    desc: "Calculate preferential duty savings under CEPA, ECTA, and bilateral FTAs. Know your advantage.",
    time: "3 min",
  },
  {
    num: "05",
    icon: FileText,
    title: "Generate Checklist",
    desc: "Get a tailored document checklist — Invoice, BL, COO, FSSAI — for your product and destination.",
    time: "Instant",
  },
  {
    num: "06",
    icon: TrendingUp,
    title: "Start Your First Shipment",
    desc: "With your readiness score, schemes, codes, and docs in place — you're ready to ship safely.",
    time: "Ready",
  },
];

const WHAT_YOU_BUILD = [
  { label: "Export readiness profile", desc: "Know your structural gaps and next operational steps" },
  { label: "Market intelligence dashboard", desc: "Target markets, FTA status, and dynamic country tariffs" },
  { label: "Scheme eligibility records", desc: "Matched incentives with step-by-step claim architectures" },
  { label: "Compliance checklist", desc: "All legal document flows mapped to your custom product line" },
  { label: "Saved country profiles", desc: "Compare and continuously track your target distribution zones" },
];

const SECTORS = [
  { emoji: "🧵", name: "Textiles & Apparel", hook: "RoSCTL, RCMC, buyer tracking" },
  { emoji: "🌶️", name: "Spices & Agriculture", hook: "APEDA, phytosanitary rules" },
  { emoji: "💊", name: "Pharmaceuticals", hook: "CDSCO NOC, WHO-GMP protocols" },
  { emoji: "💎", name: "Gems & Jewellery", hook: "GJEPC, duty drawback logs" },
  { emoji: "⚙️", name: "Engineering Goods", hook: "EPCG authorizations, BIS" },
  { emoji: "☕", name: "Tea & Coffee", hook: "Tea Board compliance, GI tags" },
  { emoji: "👜", name: "Leather & Footwear", hook: "CLE tracking, EU directives" },
  { emoji: "💻", name: "IT & Software", hook: "SEIS, SEZ infrastructure rules" },
];

const FAQS = [
  {
    q: "Is India2World free to use?",
    a: "Yes. Core tools including AI Chat, HS Code Lookup, Scheme Finder, and Document Checklist are completely free. We maintain premium accessibility essentials for Indian SME exporters.",
  },
  {
    q: "Do I need an IEC number to use this platform?",
    a: "No IEC is needed to explore data layouts. However, you will need an Import Export Code (IEC) from DGFT to execute actual shipments. Our AI system can guide you directly through the active application portal process.",
  },
  {
    q: "How accurate is the AI guidance?",
    a: "Our models sync regularly with documentation from DGFT, CBIC, APEDA, and the Spices Board. For final filings, legal parameter checking, and binding customs duties, always perform a verify sequence with a licensed broker.",
  },
  {
    q: "Which export sectors does India2World support?",
    a: "We currently offer targeted infrastructure models across 8 major sectors, including Textiles, Pharmaceuticals, Agriculture, and Software services. Each configuration adapts dynamically to your custom chat prompt guidelines.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 antialiased selection:bg-orange-50 selection:text-orange-900">
      
      {/* ── Top Premium Glass Header Layer ────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/70 px-6 py-4 backdrop-blur-md lg:px-12 transition-all">
        {/* Subtle Integrated Color Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full flex opacity-60">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-transparent" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-950">
            <Globe2 className="h-4.5 w-4.5 text-orange-500 stroke-[2]" />
            <span>India2World</span>
          </Link>
          
          {/* Menu Items */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-400">
            <Link href="#features" className="transition-colors hover:text-zinc-950">Modules</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-zinc-950">Journey</Link>
            <Link href="#sectors" className="transition-colors hover:text-zinc-950">Sectors</Link>
            <Link href="#faq" className="transition-colors hover:text-zinc-950">Documentation</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-950">
              Sign In
            </Link>
            <Link
              href="/dashboard/chat"
              className="rounded-md bg-zinc-950 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-zinc-800 shadow-sm"
            >
              Initialize Workspace
            </Link>
          </div>

          <button 
            className="md:hidden p-1 text-zinc-500 hover:text-zinc-950"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Layout */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 top-full w-full border-b border-zinc-200 bg-white/95 px-8 py-6 backdrop-blur-md">
            <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Modules</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Journey</Link>
              <Link href="#sectors" onClick={() => setMobileMenuOpen(false)}>Sectors</Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)}>Documentation</Link>
              <hr className="border-zinc-100 my-1" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link 
                href="/dashboard/chat" 
                className="w-full rounded-md bg-orange-500 py-2.5 text-center text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Canvas ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[75vh] items-center overflow-hidden bg-white border-b border-zinc-200/40">
        {/* Subtle Editorial background noise or line accent */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-zinc-50/40 border-l border-zinc-100 hidden lg:block" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left copy deck */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 flex flex-col gap-6"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                <Sparkles className="h-3 w-3 text-zinc-400 stroke-[2]" />
                Automated Infrastructure Engine
              </div>

              <h1 className="text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-5xl lg:text-6xl">
                Global trade compliance,<br />
                <span className="text-orange-500 font-medium">simplified at scale.</span>
              </h1>

              <p className="max-w-md text-[13px] leading-relaxed text-zinc-500 font-normal">
                An integrated data workspace configuring IEC tracking parameters, verified customs structures, preferential FTA logic, and trade workflows for professional Indian exporters.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <Link
                  href="/dashboard/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-600"
                >
                  Create Free Profile
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Review Platform Framework
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                {["Zero Configuration", "Production Ready", "Secure Sandbox"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right Interactive Globe Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.7 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-sm aspect-square opacity-90 scale-95 lg:scale-100">
                <Globe />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Metric Performance Node ────────────────────────────────────── */}
      <section className="border-b border-zinc-200/50 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-left">
            {[
              { target: 200, suffix: "+", label: "Export Schemes", sub: "Active GOI frameworks" },
              { target: 160, suffix: "+", label: "Countries Mapped", sub: "Global border matrices" },
              { target: 60, suffix: "+", label: "Glossary Clusters", sub: "Plain-language keys" },
              { target: 8, suffix: "", label: "Sector Channels", sub: "Optimized operational pipelines" },
            ].map((stat) => (
              <div key={stat.label} className="border-l border-zinc-100 pl-4 flex flex-col justify-center">
                <span className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
                <span className="text-[11px] font-semibold text-zinc-800 tracking-tight mt-0.5">{stat.label}</span>
                <span className="text-[10px] text-zinc-400 font-normal">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modular Core Architecture Section ────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 border-l-2 border-orange-500 pl-4 text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-1">
              Architecture Layout
            </span>
            <h2 className="text-2xl font-normal tracking-tight text-zinc-950 sm:text-3xl">
              Engineered Trade Modules
            </h2>
            <p className="max-w-md text-xs text-zinc-400 mt-1 font-normal">
              Six structural engines mapped down into a single micro-service hub layout.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-px bg-zinc-200/60 border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.href} variants={cardVariants} className="group bg-white p-6 sm:p-8 transition-all hover:bg-zinc-50/50">
                  <Link href={f.href} className="flex flex-col justify-between h-full gap-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 border border-zinc-200/40 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <Icon className="h-4 w-4 stroke-[1.5]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950 tracking-tight flex items-center gap-1.5">
                          {f.label}
                        </h3>
                        <p className="text-xs leading-relaxed text-zinc-500 mt-1 font-normal max-w-xl">{f.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 transition-colors group-hover:text-orange-500 pl-12">
                      Initialize Engine
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Operational Milestones Section ──────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#FAFAFA] border-y border-zinc-200/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-500 mb-1 block">
              Sequential Path
            </span>
            <h2 className="text-2xl font-normal tracking-tight text-zinc-950 sm:text-3xl">
              From Origin Setup to First Customs Release
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-200/60 border border-zinc-200/60 rounded-xl overflow-hidden">
            {STEPS.map((step) => {
              return (
                <div
                  key={step.num}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 gap-4"
                >
                  <div className="flex items-start gap-4 sm:items-center">
                    <span className="text-xs font-mono font-medium text-zinc-400 select-none tracking-tighter">
                      {step.num}{" //"}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-950 tracking-tight">{step.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 font-normal max-w-md">{step.desc}</p>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 pl-8 sm:pl-0">
                    <span className="inline-block rounded border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                      T-Minus {step.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Document Workspace Generation List ──────────────────────────── */}
      <section className="bg-white py-24 border-b border-zinc-200/40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
              Configuration Output
            </span>
            <h2 className="text-2xl font-normal tracking-tight text-zinc-950">
              The Workspace Asset Registry
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 border-y border-zinc-100 bg-white">
            {WHAT_YOU_BUILD.map((item, i) => (
              <div key={item.label} className="grid sm:grid-cols-3 gap-2 py-5 items-baseline hover:bg-zinc-50/40 transition-colors px-3">
                <span className="text-[11px] font-mono font-medium text-zinc-400">
                  SYS_RECORD.0{i + 1}
                </span>
                <span className="text-xs font-semibold text-zinc-950 tracking-tight sm:col-span-1">
                  {item.label}
                </span>
                <span className="text-xs text-zinc-400 font-normal sm:text-right">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channels Showcase Section ───────────────────────────────────── */}
      <section id="sectors" className="bg-[#FAFAFA] py-24 border-b border-zinc-200/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 border-l-2 border-zinc-900 pl-4 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-0.5 block">
              Global Sourcing
            </span>
            <h2 className="text-2xl font-normal tracking-tight text-zinc-950 sm:text-3xl">
              Configured Industry Vectors
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SECTORS.map((sector) => (
              <motion.div key={sector.name} variants={cardVariants}>
                <Link
                  href={`/dashboard/chat?q=Export guidance for ${encodeURIComponent(sector.name)} from India`}
                  className="group flex flex-col justify-between h-full rounded-lg border border-zinc-200/70 bg-white p-5 transition-all hover:border-zinc-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                  <div>
                    <span className="text-xl inline-block mb-3 bg-zinc-50 p-2 rounded border border-zinc-100">{sector.emoji}</span>
                    <h3 className="text-xs font-semibold text-zinc-950 tracking-tight">{sector.name}</h3>
                    <p className="text-[11px] leading-relaxed text-zinc-400 font-normal mt-0.5">{sector.hook}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-zinc-300 group-hover:text-zinc-600 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Cluster ─────────────────────────────────────────────────── */}
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-normal tracking-tight text-zinc-950">
              Technical Verification Desk
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 border-y border-zinc-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-xs font-semibold text-zinc-900 transition-colors hover:text-orange-500"
                >
                  <span>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.1 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-xs font-normal leading-relaxed text-zinc-400 max-w-xl">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clean Dark Bottom Anchor Component ────────────────────────── */}
      <section className="bg-zinc-950 text-white py-20 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.04),transparent_40%)]" />
        
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center relative z-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Initialize your environment.
            </h2>
            <p className="mx-auto max-w-xs text-xs text-zinc-400 font-normal leading-relaxed">
              Connect to custom compliance layers and streamline documentation instantly.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row mt-2 w-full sm:w-auto">
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              Launch Core Terminal
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-400 transition-colors hover:bg-white/5"
            >
              Sign Up
            </Link>
          </div>
          
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 mt-4">
            <Zap className="h-3 w-3 text-orange-500 stroke-[2.5]" />
            Core tools free forever • No license keys required
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}