import Link from "next/link";
import {
  Wand2,
  Globe2,
  FileText,
  Target,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const features = [
  { icon: Target, label: "Export Readiness Score", desc: "6-question assessment with AI action plan" },
  { icon: Wand2, label: "Scheme Finder", desc: "Match RoDTEP, EPCG, Duty Drawback & more" },
  { icon: Globe2, label: "FTA Duty Savings", desc: "14 active Free Trade Agreements covered" },
  { icon: FileText, label: "Document Checklist", desc: "Tailored to your product & destination" },
];

const stats = [
  { value: "200+", label: "Export schemes" },
  { value: "160+", label: "Countries tracked" },
  { value: "8", label: "Sectors supported" },
];

export default function AuthPromo() {
  return (
    <div className="relative hidden md:flex md:flex-col md:h-full md:w-full overflow-hidden bg-zinc-950">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="4" fill="url(#pGrad)" />
              <circle cx="9" cy="9" r="7.5" stroke="url(#pGrad)" strokeWidth="1.2" fill="none" opacity="0.6" />
              <defs>
                <linearGradient id="pGrad" x1="5" y1="5" x2="13" y2="13" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="text-sm font-bold text-white">India2World</span>
        </Link>

        {/* Main text */}
        <div className="mt-12 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-amber-400">Built for Indian exporters</span>
          </div>

          <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-white">
            Export smarter.{" "}
            <span className="text-amber-400">Ship faster.</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Your complete workspace for IEC tracking, customs compliance, FTA duty savings, and export documentation.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust line */}
        <div className="border-t border-zinc-800 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs text-zinc-500">
              No data sold · DGFT & CBIC aligned · Free forever
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-zinc-600" />
            <p className="text-xs italic text-zinc-600">
              "From 0 to first shipment in under 20 minutes."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
