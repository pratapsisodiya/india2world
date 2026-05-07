# PHASE 4: Landing Page & Saved Workspace — Detailed Execution Prompt
**For Claude AI Agent — Copy & Paste This Entire Prompt**

---

## OBJECTIVE
Complete the product with:
1. A deeper, story-driven landing page
2. A "Saved Workspace" feature to bookmark export intelligence
3. A "Market Profiles" feature for country-specific data

**Estimated Time:** ~60–90 minutes  
**Complexity:** Medium (new pages + UI components)  
**Testing:** Functional + responsive

---

## TASK 1: Deepen Landing Page
**File:** `frontend/app/(public)/page.tsx`

### Current State
Landing page has:
- Tricolor stripe + hero
- Stats bar + globe
- "How It Works" with 3 steps
- Sectors list
- FAQs
- Various CTAs

### What To Change
- Rename/reframe "How It Works" to "Your Export Workflow"
- Add a 6-step detailed workflow section
- Add "What You'll Build" outcome cards
- Add stronger, multi-destination CTAs
- Deepen the sector section with micro-stories

### Exact Changes

**Find this section (search for "How it works"):**
```typescript
        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
            How it works
          </h2>
          <h3 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Three simple steps
          </h3>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.num} variants={cardVariants} className="flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-saffron-100 text-xl font-bold text-saffron-600 dark:bg-saffron-500/20 dark:text-saffron-400">
                    {step.num}
                  </div>
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h4>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
```

**Replace it with:**
```typescript
        {/* Export Workflow — Detailed */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
            Your Export Workflow
          </h2>
          <h3 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
            From Planning to First Shipment
          </h3>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A practical journey backed by AI guidance, government data, and export compliance expertise.
          </p>

          {/* 6-Step Workflow */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: Target, step: "01", title: "Assess Readiness", desc: "Take a 6-question assessment to understand your export preparedness. Get a personalized gap analysis." },
              { icon: Wand2, step: "02", title: "Find Schemes", desc: "Match yourself to RoDTEP, EPCG, duty drawback — schemes you qualify for with claim steps." },
              { icon: Hash, step: "03", title: "Verify HS Codes", desc: "Search 500+ ITC-HS codes. Know your product classification before filing any export document." },
              { icon: Globe2, step: "04", title: "Calculate Tariffs", desc: "See FTA savings under CEPA, SAFTA, bilateral agreements. Know your duty advantage." },
              { icon: FileText, step: "05", title: "Generate Checklist", desc: "Get a complete document checklist: invoice, bill of lading, CoO, phytosanitary certs, and more." },
              { icon: Sparkles, step: "06", title: "Ship with Confidence", desc: "Execute your first shipment with AI guidance on procedures, port requirements, and compliance." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} variants={cardVariants} className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 hover:ring-saffron-300 dark:hover:ring-saffron-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-saffron-100 text-saffron-600 dark:bg-saffron-500/20 dark:text-saffron-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mt-1">Step {item.step}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* What You'll Build — Outcomes */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
            What You'll Build
          </h2>
          <h3 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
            A Complete Export Profile
          </h3>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {[
              { icon: Target, title: "Export Readiness Profile", desc: "Know exactly where you stand with personalized recommendations." },
              { icon: BookOpen, title: "Market Intelligence Hub", desc: "Compare countries, tariffs, FTA status, and compliance hotspots." },
              { icon: Landmark, title: "Scheme Eligibility Records", desc: "See which government export schemes you qualify for." },
              { icon: FileText, title: "Compliance Checklist", desc: "Documents & certifications you need for each market." },
              { icon: Globe2, title: "Saved Country Profiles", desc: "Pin markets you're serious about — all your data in one place." },
              { icon: MessageSquare, title: "Export AI Advisor", desc: "Chat anytime with Claude — ask anything about export procedures." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} variants={cardVariants} className="flex flex-col gap-3 rounded-xl bg-linear-to-br from-saffron-50 to-orange-50 p-6 border border-saffron-100 dark:from-saffron-500/10 dark:to-orange-500/10 dark:border-saffron-500/20">
                  <Icon className="h-6 w-6 text-saffron-600 dark:text-saffron-400" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
```

### After Completing This Task
- [ ] Landing page updated with 6-step workflow
- [ ] "What You'll Build" section added
- [ ] No TypeScript errors
- [ ] Test: `npm run dev`, navigate to `/` — see new sections

---

## TASK 2: Create Saved Workspace Page
**New File:** `frontend/app/(dashboard)/saved/page.tsx`

### Purpose
Hub for all saved export intelligence: schemes, countries, HS codes, glossary terms, and chat snippets.

### Create New File

Create `frontend/app/(dashboard)/saved/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Bookmark } from "lucide-react";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";

type SavedItemType = "scheme" | "country" | "hs-code" | "glossary" | "chat";

interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  description?: string;
  href: string;
  savedAt: number;
}

const TABS: Array<{ id: SavedItemType; label: string }> = [
  { id: "scheme", label: "Schemes" },
  { id: "country", label: "Markets" },
  { id: "hs-code", label: "HS Codes" },
  { id: "glossary", label: "Glossary" },
  { id: "chat", label: "Chats" },
];

// Mock saved items — in production, these come from a saved store
const MOCK_SAVED_ITEMS: SavedItem[] = [
  {
    id: "1",
    type: "scheme",
    title: "RoDTEP — Remission of Duties and Taxes on Exported Products",
    description: "Refund scheme for embedded taxes. Apply for all goods exports.",
    href: "/dashboard/schemes",
    savedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "2",
    type: "scheme",
    title: "EPCG — Export Promotion Capital Goods Scheme",
    description: "Import capital goods at zero duty for export-oriented units.",
    href: "/dashboard/schemes",
    savedAt: Date.now() - 86400000,
  },
  {
    id: "3",
    type: "country",
    title: "UAE — United Arab Emirates",
    description: "India-UAE CEPA in force. Zero duty on most Indian goods.",
    href: "/dashboard/countries?market=AE",
    savedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "4",
    type: "country",
    title: "Singapore — Free Port Hub",
    description: "ASEAN FTA. Strategic re-export hub for Southeast Asia.",
    href: "/dashboard/countries?market=SG",
    savedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "5",
    type: "hs-code",
    title: "5208.31 — 100% Cotton Denim",
    description: "HS code for denim fabrics. Used for textile exports.",
    href: "/dashboard/hs-codes",
    savedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "6",
    type: "glossary",
    title: "CIF — Cost, Insurance & Freight",
    description: "Incoterm where seller covers all costs, insurance & freight.",
    href: "/dashboard/glossary",
    savedAt: Date.now(),
  },
];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<SavedItemType>("scheme");
  const [savedItems, setSavedItems] = useState<SavedItem[]>(MOCK_SAVED_ITEMS);

  const filtered = savedItems.filter((item) => item.type === activeTab);

  const handleUnsave = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Saved Workspace
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your bookmarked export intelligence — schemes, markets, HS codes, and more.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {TABS.map((tab) => {
            const count = savedItems.filter((item) => item.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-saffron-600 text-saffron-600 dark:border-saffron-400 dark:text-saffron-400"
                    : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <Bookmark className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              No saved {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Bookmark items as you explore to save them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 flex items-start justify-between transition-colors hover:ring-saffron-300 dark:hover:ring-saffron-500/30"
              >
                <Link href={item.href} className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:text-saffron-600 dark:hover:text-saffron-400 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                    Saved {formatDate(item.savedAt)}
                  </p>
                </Link>

                <div className="ml-4 flex shrink-0 gap-2">
                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-saffron-100 hover:text-saffron-600 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-saffron-500/20 dark:hover:text-saffron-400"
                    title="View item"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleUnsave(item.id)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-red-100 hover:text-red-600 transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Guidance */}
        {savedItems.length === 0 && (
          <div className="mt-12 rounded-2xl bg-linear-to-br from-saffron-50 to-orange-50 p-8 border border-saffron-100 dark:from-saffron-500/5 dark:to-orange-500/5 dark:border-saffron-500/20">
            <h3 className="text-lg font-semibold text-saffron-900 dark:text-saffron-50">
              Start Building Your Workspace
            </h3>
            <p className="mt-2 text-sm text-saffron-800 dark:text-saffron-200">
              As you explore export tools, save useful schemes, countries, and HS codes. They'll appear here for quick reference.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/schemes"
                className="inline-flex items-center gap-1 text-sm font-medium text-saffron-700 hover:text-saffron-900 dark:text-saffron-300 dark:hover:text-saffron-100"
              >
                Browse Schemes →
              </Link>
              <Link
                href="/dashboard/countries"
                className="inline-flex items-center gap-1 text-sm font-medium text-saffron-700 hover:text-saffron-900 dark:text-saffron-300 dark:hover:text-saffron-100"
              >
                Explore Markets →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created at `frontend/app/(dashboard)/saved/page.tsx`
- [ ] No TypeScript errors
- [ ] Test: Navigate to `/dashboard/saved` — see mock items and tabs

---

## TASK 3: Create Market Profiles Page (Enhanced Countries)
**New File or Enhanced:** `frontend/app/(dashboard)/countries/page.tsx`

### Purpose
Detailed country profiles with tariff info, FTA status, compliance requirements, and market insights.

### Create or Replace File

Create `frontend/app/(dashboard)/countries/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe2, Check, AlertCircle, TrendingUp, Bookmark } from "lucide-react";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";

export default function CountriesPage() {
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get("market");
  
  const [expandedCountry, setExpandedCountry] = useState(selectedCountry || null);
  const [savedCountries, setSavedCountries] = useState<string[]>([]);

  const handleSave = (code: string) => {
    setSavedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Export Market Profiles
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Explore tariffs, FTA status, compliance requirements, and market opportunities for India's top export destinations.
          </p>
        </div>

        {/* Markets Grid */}
        <div className="space-y-4">
          {TOP_EXPORT_DESTINATIONS.map((country) => {
            const isExpanded = expandedCountry === country.code;
            const isSaved = savedCountries.includes(country.code);

            return (
              <div
                key={country.code}
                className="rounded-2xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden transition-all hover:ring-saffron-300 dark:hover:ring-saffron-500/30"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedCountry(isExpanded ? null : country.code)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-3xl shrink-0">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {country.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {country.ftaWithIndia && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <Check className="h-3 w-3" />
                            {country.ftaWithIndia}
                          </span>
                        )}
                        {!country.ftaWithIndia && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            No active FTA with India
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(country.code);
                      }}
                      className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${
                        isSaved
                          ? "bg-saffron-100 text-saffron-600 dark:bg-saffron-500/20 dark:text-saffron-400"
                          : "bg-zinc-100 text-zinc-600 hover:bg-saffron-100 hover:text-saffron-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-saffron-500/20 dark:hover:text-saffron-400"
                      }`}
                      title={isSaved ? "Unsave market" : "Save market"}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                    <div className="text-zinc-400">
                      {isExpanded ? "▼" : "▶"}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Regulators */}
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                          Key Regulators & Certifications
                        </h4>
                        <ul className="space-y-1">
                          {country.keyRegulators.map((reg) => (
                            <li key={reg} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              {reg}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Market Notes */}
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                          Market Insights
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-5">
                          {country.notes}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/chat?q=Tell me about exporting to ${country.name} from India`}
                        className="inline-flex items-center gap-1 rounded-lg bg-saffron-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-saffron-700 dark:bg-saffron-500 dark:hover:bg-saffron-600"
                      >
                        Ask AI About This Market
                      </Link>
                      <Link
                        href={`/dashboard/fta?market=${country.code}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                      >
                        Calculate Tariffs
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-12 rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 p-6 border border-blue-100 dark:from-blue-500/5 dark:to-cyan-500/5 dark:border-blue-500/20">
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-50">
                Pro Tip: FTA Advantage
              </h4>
              <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
                Export to FTA markets first to maximize tariff benefits. Use India2World's FTA calculator to see real savings on your products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created at `frontend/app/(dashboard)/countries/page.tsx`
- [ ] No TypeScript errors
- [ ] Test: Navigate to `/dashboard/countries` — see all countries
- [ ] Click on a country to expand details
- [ ] Save/unsave countries (state persists during session)

---

## TASK 4: Update Sidebar to Link to Saved & Countries Pages
**File:** `frontend/components/layout/Sidebar.tsx`

### Check Current Links

The sidebar should already have links. Verify these routes are in the `sidebarGroups` array:
```typescript
const sidebarGroups = [
  {
    label: "AI Tools",
    links: [
      // ...
      { href: "/dashboard/countries", label: "Country Profiles", icon: Globe2 },
      // ...
    ],
  },
  {
    label: "Reference",
    links: [
      // ...
      { href: "/dashboard/saved", label: "Saved Items", icon: Bookmark },
    ],
  },
];
```

**If not present, add them manually** (see sidebar structure in earlier phases).

---

## VERIFICATION CHECKLIST

After completing all Phase 4 tasks:

### Landing Page
- [ ] Navigate to `/`
- [ ] See 6-step workflow section with icons and descriptions
- [ ] See "What You'll Build" outcome cards
- [ ] All sections are responsive on mobile

### Saved Workspace
- [ ] Navigate to `/dashboard/saved`
- [ ] See tabs for Schemes, Markets, HS Codes, Glossary, Chats
- [ ] Mock items display correctly
- [ ] Click "View" icon → navigates to related page
- [ ] Click trash → removes item from list

### Market Profiles
- [ ] Navigate to `/dashboard/countries`
- [ ] See all export destinations listed
- [ ] Click to expand country details
- [ ] See regulators, market notes, and action buttons
- [ ] Click "Save" icon → toggles save state
- [ ] Click "Ask AI" → navigates to chat with pre-filled query
- [ ] Click "Calculate Tariffs" → navigates to FTA page

### Navigation
- [ ] Sidebar has links to `/dashboard/saved` and `/dashboard/countries`
- [ ] Header + dashboard link to these pages
- [ ] Mobile responsive

### Console & Errors
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All images/icons load

---

## COMMON ISSUES & FIXES

### Issue: "Cannot find module 'TOP_EXPORT_DESTINATIONS'"
**Fix:** Ensure imports:
```typescript
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";
```

### Issue: "useSearchParams is not working"
**Fix:** Make sure page is marked as "use client" at the top

### Issue: Landing page 6-step cards don't align
**Fix:** Check grid classes: `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`

### Issue: Saved items don't persist between page refreshes
**Fix:** That's correct behavior for mock items. In production, save to a Zustand store or database.

---

## SUMMARY OF CHANGES

| File | Type | Impact |
|------|------|--------|
| `app/(public)/page.tsx` | Modified | Landing page now tells deeper export story |
| `app/(dashboard)/saved/page.tsx` | New | Central hub for saved export intelligence |
| `app/(dashboard)/countries/page.tsx` | New | Detailed market profiles with compliance data |
| `components/layout/Sidebar.tsx` | Updated (if needed) | Links to new pages |

**Total new code:** ~600 lines  
**Complexity:** Medium  
**Risk:** Low (no breaking changes)

---

## NEXT STEPS — FINAL VERIFICATION

After Phase 4:

1. **Full App Walkthrough**
   - Start at `/` (landing page)
   - Click CTA → goes to `/dashboard`
   - Click "Explore Markets" → `/dashboard/countries`
   - Save a market
   - Click "Saved Items" → `/dashboard/saved` — saved market appears
   - Click "Ask AI" → `/dashboard/chat`
   - Full loop works

2. **Mobile Test**
   - Responsive on all screen sizes
   - Touch-friendly buttons
   - No layout breaks

3. **State Persistence**
   - Refresh page
   - Saved items stay (in session)
   - User profile persists
   - Chat history persists

4. **Performance**
   - App loads quickly
   - No lag on interactions
   - Console clean

---

## CELEBRATORY FINAL STEP ✨

After completing all 4 phases:
1. You've deepened India2World from a landing page → **a real export OS**
2. Added workspace features (saved items, history, profiles)
3. Personalized dashboard & chat experience
4. Enhanced stores for better data flow
5. Created market intelligence surfaces

**The app now feels like a serious platform, not just a tool. Users can:**
- Plan their export journey with AI
- Access government data via intelligent search
- Save & revisit export intelligence
- See personalized recommendations based on their stage
- Take actions (chat, calculate, verify, generate)

---

**Ready to execute Phase 4?** 🚀

