"use client";

import { useState } from "react";
import { Sun, Moon, Monitor, Trash2, Download, CheckCircle2, Circle } from "lucide-react";
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
  { value: "merchant-exporter", label: "Merchant Exporter", desc: "You export on behalf of manufacturers" },
  { value: "service", label: "Service Exporter", desc: "IT, ITES, consulting, or other services" },
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

function profileCompleteness(profile: UserProfile): number {
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
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
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

  const completeness = profileCompleteness(profile);

  function clearChatHistory() {
    clearMessages();
    setShowClearConfirm(false);
  }

  function exportProfile() {
    const data = JSON.stringify(profile, null, 2);
    const blob = new Blob([data], { type: "application/json" });
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
    setProfile({ complianceFocus: next });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Settings
          </h1>
        </div>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Appearance
          </h2>
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <label className="mb-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Theme
            </label>
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
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
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

        {/* Profile */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Export Profile
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-saffron-500 transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-500">{completeness}% complete</span>
              </div>
              <button
                type="button"
                onClick={exportProfile}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="space-y-5">
              {/* Business name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Business name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ businessName: e.target.value })}
                  placeholder="Your business name"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Business type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Business type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypeOptions.map((opt) => {
                    const active = profile.businessType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProfile({ businessType: active ? "" : opt.value })}
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
                <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Primary sector
                </label>
                <select
                  value={profile.sector}
                  onChange={(e) => setProfile({ sector: e.target.value })}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {sectorOptions.map((s) => (
                    <option key={s} value={s}>
                      {s || "Select a sector"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ location: e.target.value })}
                  placeholder="City, State"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Export products */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Export products
                </label>
                <input
                  type="text"
                  value={profile.exportProducts}
                  onChange={(e) => setProfile({ exportProducts: e.target.value })}
                  placeholder="e.g. black pepper, turmeric, spice mixes"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Preferred currency */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Preferred invoice currency
                </label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((cur) => {
                    const active = profile.preferredCurrency === cur;
                    return (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setProfile({ preferredCurrency: cur })}
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
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
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
                          setProfile({ targetMarkets: updated });
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
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Export stage
                </label>
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
                        onClick={() => setProfile({ exportStage: active ? "" : stage })}
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
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Registration status
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.hasIEC}
                      onChange={(e) => setProfile({ hasIEC: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300 text-saffron-500 focus:ring-saffron-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">I have an IEC code</p>
                      <p className="text-[10px] text-zinc-500">Import Export Code registered with DGFT</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.isoVerified}
                      onChange={(e) => setProfile({ isoVerified: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300 text-saffron-500 focus:ring-saffron-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">ISO certified</p>
                      <p className="text-[10px] text-zinc-500">ISO 9001, ISO 22000, or other relevant certification</p>
                    </div>
                  </label>
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

        {/* Export Milestones */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Export Milestones
          </h2>
          <div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
            <p className="px-5 py-3 text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
              Track your export journey. Click to mark a milestone complete.
            </p>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
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

        {/* Chat */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Chat
          </h2>
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Clear conversation history
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Deletes the current chat session. Saved threads are preserved.
                </p>
              </div>
              {showClearConfirm ? (
                <div className="flex gap-2">
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
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear history
                </button>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            About
          </h2>
          <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">India2World</span>{" "}
                v0.3.0
              </p>
              <p>
                AI-powered export workspace for Indian businesses. Built with Next.js and Claude.
              </p>
              <p className="text-xs">
                Always confirm duty rates, scheme terms, and regulations with DGFT, ICEGATE, or a
                licensed customs broker before acting.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
