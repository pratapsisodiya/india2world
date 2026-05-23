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
  },
  {
    href: "/dashboard/schemes/wizard",
    icon: Wand2,
    label: "Scheme Finder",
    desc: "Answer 5 questions. Get matched to RoDTEP, EPCG, MEIS, duty drawback schemes you can claim.",
  },
  {
    href: "/dashboard/hs-codes",
    icon: Hash,
    label: "HS Code Lookup",
    desc: "Search 500+ ITC-HS codes by product name or keyword. Know your classification before filing.",
  },
  {
    href: "/dashboard/fta",
    icon: Globe2,
    label: "FTA Calculator",
    desc: "Calculate preferential duty savings under CEPA, SAFTA, and bilateral FTAs. Know your tariff advantage.",
  },
  {
    href: "/dashboard/readiness",
    icon: Target,
    label: "Readiness Score",
    desc: "Take the 6-question export readiness assessment. Get a personalised gap analysis and action plan.",
  },
  {
    href: "/dashboard/checklist",
    icon: FileText,
    label: "Document Checklist",
    desc: "Know exactly which documents you need for each product and destination before your first shipment.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Assess Your Readiness",
    desc: "Take the 6-question export assessment. Get a score and plan in under 6 minutes.",
    time: "6 min",
  },
  {
    num: "02",
    title: "Find Matching Schemes",
    desc: "Answer 5 questions and get matched to RoDTEP, EPCG, and other incentives.",
    time: "5 min",
  },
  {
    num: "03",
    title: "Verify HS Codes",
    desc: "Search and verify ITC-HS codes for your product to ensure correct duty rates.",
    time: "2 min",
  },
  {
    num: "04",
    title: "Calculate FTA Savings",
    desc: "Calculate preferential duty savings under CEPA, ECTA, and bilateral FTAs.",
    time: "3 min",
  },
  {
    num: "05",
    title: "Generate Checklist",
    desc: "Get a tailored document checklist for your product and destination.",
    time: "Instant",
  },
  {
    num: "06",
    title: "Start First Shipment",
    desc: "With readiness, schemes, codes, and docs in place — you're ready to ship.",
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

/* ─── Animations ───────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900 antialiased selection:bg-orange-100 selection:text-orange-900">
      
      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-xl lg:px-12 transition-all">
        {/* Top subtle color bar (Indian Flag motif) */}
        <div className="absolute top-0 left-0 flex h-0.5 w-full opacity-80">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
            <Globe2 className="h-5 w-5 text-orange-500" />
            <span>India2World</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <Link href="#features" className="hover:text-zinc-900 transition-colors">Modules</Link>
            <Link href="#how-it-works" className="hover:text-zinc-900 transition-colors">Journey</Link>
            <Link href="#sectors" className="hover:text-zinc-900 transition-colors">Sectors</Link>
            <Link href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/dashboard/chat"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Workspace
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-zinc-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute left-0 top-full w-full border-b border-zinc-100 bg-white px-6 py-6 shadow-xl"
            >
              <div className="flex flex-col gap-4 text-sm font-medium text-zinc-600">
                <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Modules</Link>
                <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Journey</Link>
                <Link href="#sectors" onClick={() => setMobileMenuOpen(false)}>Sectors</Link>
                <Link href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <hr className="border-zinc-100 my-2" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link 
                  href="/dashboard/chat" 
                  className="w-full rounded-lg bg-orange-500 py-3 text-center text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free Workspace
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-white">
        {/* Minimal grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="flex flex-col gap-8 z-10"
            >
              <motion.div variants={fadeUp} className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                Automated Infrastructure Engine
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl font-medium leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl lg:text-[4rem]">
                Global trade compliance,<br />
                <span className="text-zinc-500">simplified at scale.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="max-w-lg text-lg text-zinc-500 leading-relaxed">
                An integrated data workspace configuring IEC tracking parameters, verified customs structures, and preferential FTA logic for Indian exporters.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row pt-4">
                <Link
                  href="/dashboard/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Free Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-100 px-8 py-3.5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-200"
                >
                  Explore Platform
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-md aspect-square rounded-full bg-zinc-50 flex items-center justify-center shadow-2xl shadow-zinc-200/50">
                <Globe />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Metrics ───────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {[
              { target: 200, suffix: "+", label: "Export Schemes" },
              { target: 160, suffix: "+", label: "Countries Mapped" },
              { target: 60, suffix: "+", label: "Glossary Clusters" },
              { target: 8, suffix: "", label: "Sector Channels" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
                <span className="text-sm font-medium text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules (Features) ────────────────────────────────────────────── */}
      <section id="features" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              Engineered Trade Modules
            </h2>
            <p className="mt-4 text-lg text-zinc-500">
              Six structural engines combined into a single, unified workspace to handle all your compliance and research needs.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.href} variants={fadeUp}>
                  <Link href={f.href} className="group flex h-full flex-col gap-6 rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-zinc-200">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 mb-2">{f.label}</h3>
                      <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Journey (Steps) ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-20">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              From Origin to Export
            </h2>
            <p className="mt-4 text-lg text-zinc-500">The clear path from setup to your first customs release.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col gap-4 rounded-3xl bg-white p-8 border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium text-orange-500">{step.num}</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                    {step.time}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-zinc-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workspace Output ──────────────────────────────────────────────── */}
      <section className="py-32 bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-medium tracking-tight text-zinc-900 mb-12 text-center">
            Workspace Asset Registry
          </h2>
          
          <div className="flex flex-col gap-4">
            {WHAT_YOU_BUILD.map((item, i) => (
              <div key={item.label} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-6 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-zinc-400">0{i + 1}</span>
                  <span className="text-base font-medium text-zinc-900">{item.label}</span>
                </div>
                <span className="text-sm text-zinc-500 sm:text-right">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sectors ───────────────────────────────────────────────────────── */}
      <section id="sectors" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
              Configured Industry Vectors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTORS.map((sector) => (
              <Link
                key={sector.name}
                href={`/dashboard/chat?q=Export guidance for ${encodeURIComponent(sector.name)}`}
                className="group flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 transition-all hover:bg-white hover:shadow-md hover:border-zinc-200"
              >
                <span className="text-3xl">{sector.emoji}</span>
                <div>
                  <h3 className="text-base font-medium text-zinc-900 mb-1">{sector.name}</h3>
                  <p className="text-sm text-zinc-500">{sector.hook}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-32 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-medium tracking-tight text-zinc-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="flex flex-col divide-y divide-zinc-200">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-6">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-base font-medium text-zinc-900">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm leading-relaxed text-zinc-600">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Bottom Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-900 py-32 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <h2 className="text-4xl font-medium tracking-tight text-white mb-6">
            Ready to initialize?
          </h2>
          <p className="text-lg text-zinc-400 mb-10">
            Connect to custom compliance layers and streamline documentation instantly. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            >
              Start Free Workspace
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-zinc-700 bg-transparent px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Contact Sales
            </Link>
          </div>
          
          <p className="mt-8 flex justify-center items-center gap-2 text-xs text-zinc-500">
            <Zap className="h-4 w-4 text-orange-500" />
            Core tools free forever • No license keys required
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}