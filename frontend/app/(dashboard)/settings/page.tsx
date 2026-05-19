"use client";

import { useState, useEffect } from "react";
import {
  Sun, Moon, Monitor, Trash2, Download, CheckCircle2, Circle,
  User, Palette, Target, Award, MessageSquare, Info,
  Building2, MapPin, Package, Banknote, ShieldCheck, Globe2,
  Check,
} from "lucide-react";
import { useThemeStore, type Theme } from "@/store/theme";
import { useUserStore, type ExportStage, type BusinessType, type UserProfile } from "@/store/user";
import { useChatStore } from "@/store/chat";
import { useActivityStore, type MilestoneKind } from "@/store/activity";
import { cn } from "@/lib/cn";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const sectorOptions = [
  "",
  "Textiles & apparel",
  "Handicrafts",
  "Spices & agri",
  "Gems & jewellery",
  "Engineering goods",
  "Pharma & life sciences",
  "IT & ITES services",
  "Leather & footwear",
  "Other",
];

const businessTypeOptions: { value: BusinessType; label: string; desc: string }[] = [
  { value: "manufacturer", label: "Manufacturer", desc: "You make the product you export" },
  { value: "trader", label: "Trader / Merchant", desc: "You buy and resell for export" },
  { value: "merchant-exporter", label: "Merchant Exporter", desc: "Export on behalf of manufacturers" },
  { value: "service", label: "Service Exporter", desc: "IT, ITES, consulting, or services" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD", "AUD", "JPY", "CNY"];

const COMPLIANCE_OPTIONS = [
  "FSSAI (Food Safety)",
  "BIS (Standards)",
  "CDSCO (Pharma/Medical)",
  "APEDA (Agri)",
  "Spices Board",
  "Tea Board",
  "Coffee Board",
  "GJEPC (Gems & Jewellery)",
  "CLE (Leather)",
  "EEPC (Engineering)",
];

function profileCompleteness(profile: UserProfile): { score: number; filled: number; total: number } {
  const fields = [
    !!profile.businessName,
    !!profile.businessType,
    !!profile.sector,
    !!profile.location,
    !!profile.exportProducts,
    profile.targetMarkets.length > 0,
    !!profile.exportStage,
    typeof profile.readinessScore === "number",
    profile.hasIEC,
    (profile.complianceFocus ?? []).length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return { score: Math.round((filled / fields.length) * 100), filled, total: fields.length };
}

function SectionHeading({ icon: Icon, title, subtitle }: { icon: typeof User; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-saffron-50 dark:bg-saffron-500/10">
        <Icon className="h-4 w-4 text-saffron-600 dark:text-saffron-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function AutoSaveToast({ show }: { show: boolean }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all duration-300 dark:bg-white dark:text-zinc-900",
      show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
    )}>
      <Check className="h-3.5 w-3.5 text-india-green-400 dark:text-india-green-600" />
      Profile saved
    </div>
  );
}

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const milestones = useActivityStore((s) => s.milestones);
  const completeMilestone = useActivityStore((s) => s.completeMilestone);
  const resetMilestone = useActivityStore((s) => s.resetMilestone);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { score: completeness, filled, total } = profileCompleteness(profile);

  function handleProfileChange(partial: Partial<UserProfile>) {
    setProfile(partial);
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(() => setShowSavedToast(true), 400);
    setSaveTimer(t);
  }

  useEffect(() => {
    if (showSavedToast) {
      const t = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showSavedToast]);

  function clearChatHistory() {
    clearMessages();
    setShowClearConfirm(false);
  }

  function exportProfile() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "india2world-profile.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleCompliance(item: string) {
    const current = profile.complianceFocus ?? [];
    const next = current.includes(item)
      ? current.filter((c) => c !== item)
      : [...current, item];
    handleProfileChange({ complianceFocus: next });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your export profile, appearance, and preferences.
          </p>
        </div>

        {/* Profile completeness banner */}
        <div className="mb-8 rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Profile completeness
                </p>
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  completeness === 100 ? "text-india-green-600 dark:text-india-green-400" : "text-saffron-600 dark:text-saffron-400"
                )}>
                  {completeness}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    completeness === 100 ? "bg-india-green-500" : "bg-saffron-500"
                  )}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                {filled} of {total} fields filled — a complete profile gives better AI recommendations.
              </p>
            </div>
            <button
              type="button"
              onClick={exportProfile}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        {/* ── Appearance ───────────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeading icon={Palette} title="Appearance" />
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <label className="mb-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Theme</label>
            <div className="flex gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-saffron-500 bg-saffron-500 text-white"
                        : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Export Profile ───────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeading icon={User} title="Export Profile" subtitle="Used to personalise AI responses and scheme recommendations" />
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="space-y-5">

              {/* Business name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  Business name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => handleProfileChange({ businessName: e.target.value })}
                  placeholder="Your business name"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Business type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Business type</label>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypeOptions.map((opt) => {
                    const active = profile.businessType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleProfileChange({ businessType: active ? "" : opt.value })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-left transition-colors",
                          active
                            ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/10"
                            : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        )}
                      >
                        <p className={cn("text-xs font-semibold", active ? "text-saffron-700 dark:text-saffron-400" : "text-zinc-800 dark:text-zinc-200")}>
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary sector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Primary sector</label>
                <select
                  value={profile.sector}
                  onChange={(e) => handleProfileChange({ sector: e.target.value })}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {sectorOptions.map((s) => (
                    <option key={s} value={s}>{s || "Select a sector"}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleProfileChange({ location: e.target.value })}
                  placeholder="City, State"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Export products */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Package className="h-3.5 w-3.5 text-zinc-400" />
                  Export products
                </label>
                <input
                  type="text"
                  value={profile.exportProducts}
                  onChange={(e) => handleProfileChange({ exportProducts: e.target.value })}
                  placeholder="e.g. black pepper, turmeric, spice mixes"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Preferred currency */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Banknote className="h-3.5 w-3.5 text-zinc-400" />
                  Preferred invoice currency
                </label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((cur) => {
                    const active = profile.preferredCurrency === cur;
                    return (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => handleProfileChange({ preferredCurrency: cur })}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                          active
                            ? "bg-saffron-500 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        )}
                      >
                        {cur}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target markets */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Globe2 className="h-3.5 w-3.5 text-zinc-400" />
                  Target markets
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOP_EXPORT_DESTINATIONS.map((dest) => {
                    const selected = profile.targetMarkets.includes(dest.code);
                    return (
                      <button
                        key={dest.code}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? profile.targetMarkets.filter((c) => c !== dest.code)
                            : [...profile.targetMarkets, dest.code];
                          handleProfileChange({ targetMarkets: updated });
                        }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "bg-saffron-500 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        )}
                      >
                        {dest.flag} {dest.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export stage */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">Export stage</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["planning", "registered", "first-shipment", "scaling"] as ExportStage[]).map((stage) => {
                    const labels: Record<ExportStage, string> = {
                      planning: "Planning",
                      registered: "Registered",
                      "first-shipment": "First shipment",
                      scaling: "Scaling",
                    };
                    const descs: Record<ExportStage, string> = {
                      planning: "Researching & preparing",
                      registered: "Have IEC, RCMC, GST",
                      "first-shipment": "Ready to ship",
                      scaling: "Expanding markets",
                    };
                    const active = profile.exportStage === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleProfileChange({ exportStage: active ? "" : stage })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-left transition-colors",
                          active
                            ? "border-saffron-500 bg-saffron-50 dark:bg-saffron-500/15"
                            : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        )}
                      >
                        <p className={cn("text-xs font-semibold", active ? "text-saffron-700 dark:text-saffron-400" : "text-zinc-700 dark:text-zinc-300")}>
                          {labels[stage]}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                          {descs[stage]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Registration status */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                  Registration status
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      key: "hasIEC" as const,
                      label: "I have an IEC code",
                      desc: "Import Export Code registered with DGFT",
                    },
                    {
                      key: "isoVerified" as const,
                      label: "ISO certified",
                      desc: "ISO 9001, ISO 22000, or other relevant certification",
                    },
                  ].map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={profile[key]}
                        onChange={(e) => handleProfileChange({ [key]: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 accent-saffron-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
                        <p className="text-[10px] text-zinc-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Compliance focus */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Compliance focus
                  <span className="ml-1.5 text-xs font-normal text-zinc-500">(select relevant bodies)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPLIANCE_OPTIONS.map((item) => {
                    const selected = (profile.complianceFocus ?? []).includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCompliance(item)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "bg-india-green-500 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Export Milestones ─────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeading icon={Award} title="Export Milestones" subtitle="Track your export journey — click to mark complete" />
          <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <button
                    type="button"
                    onClick={() =>
                      m.completedAt
                        ? resetMilestone(m.id as MilestoneKind)
                        : completeMilestone(m.id as MilestoneKind)
                    }
                    className="shrink-0"
                  >
                    {m.completedAt ? (
                      <CheckCircle2 className="h-5 w-5 text-india-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-300 hover:text-saffron-400 dark:text-zinc-600 transition-colors" />
                    )}
                  </button>
                  <span className={cn("flex-1 text-sm", m.completedAt ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200")}>
                    {m.label}
                  </span>
                  {m.completedAt && (
                    <span className="shrink-0 text-xs text-zinc-400">
                      {new Date(m.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chat ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionHeading icon={MessageSquare} title="Chat" />
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Clear conversation history
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Deletes the current chat session. Saved threads are preserved.
                </p>
              </div>
              {showClearConfirm ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearChatHistory}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Confirm delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear history
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── About ─────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={Info} title="About" />
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">India2World</p>
                <p className="text-xs text-zinc-500">Version 0.3.0</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron-50 dark:bg-saffron-500/10">
                <Globe2 className="h-5 w-5 text-saffron-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI-powered export workspace for Indian businesses. Built with Next.js and Claude.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "DGFT", href: "https://dgft.gov.in", desc: "Export licences & schemes" },
                { label: "ICEGATE", href: "https://icegate.gov.in", desc: "Customs & HS codes" },
                { label: "Export.gov.in", href: "https://www.export.gov.in", desc: "Exporter resources" },
                { label: "RBI FEMA", href: "https://www.rbi.org.in", desc: "Foreign exchange rules" },
              ].map(({ label, href, desc }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
                  <span className="text-zinc-400">{desc}</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              Always confirm duty rates, scheme terms, and regulations with DGFT, ICEGATE, or a licensed customs broker before acting.
            </p>
          </div>
        </section>

      </div>

      <AutoSaveToast show={showSavedToast} />
    </div>
  );
}
