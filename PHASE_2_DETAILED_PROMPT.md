# PHASE 2: Dashboard Intelligence & Personalization — Detailed Execution Prompt
**For Claude AI Agent — Copy & Paste This Entire Prompt**

---

## OBJECTIVE
Transform the dashboard from a list of cards into a personalized, intelligent command center by:
1. Creating smart action cards driven by user stage + readiness
2. Adding an export roadmap timeline
3. Surfacing market intelligence
4. Personalizing card order and suggestions

**Estimated Time:** ~45–60 minutes  
**Complexity:** Medium (new components + store integration)  
**Testing:** After each component, test in browser

---

## TASK 1: Create NextActionCard Component
**New File:** `frontend/components/dashboard/NextActionCard.tsx`

### Purpose
Show the user ONE actionable next step based on their export stage and readiness score.

### Create New File
Create a new file at `frontend/components/dashboard/NextActionCard.tsx` with this content:

```typescript
"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface NextActionCardProps {
  stage?: string;
  readinessScore?: number;
}

export function NextActionCard({ stage = "planning", readinessScore = 0 }: NextActionCardProps) {
  type StageAction = {
    title: string;
    description: string;
    cta: string;
    href: string;
    icon: React.ReactNode;
  };

  const actions: Record<string, StageAction> = {
    planning: {
      title: "Assess Your Export Readiness",
      description: "Take a quick 6-question assessment to understand your export preparedness and get a personalized gap analysis.",
      cta: "Start Readiness Score",
      href: "/dashboard/readiness",
      icon: <Sparkles className="h-5 w-5" />,
    },
    registered: {
      title: "Find Government Schemes",
      description: "You're registered. Now match yourself to RoDTEP, EPCG, and duty drawback schemes you qualify for.",
      cta: "Find My Schemes",
      href: "/dashboard/schemes/wizard",
      icon: <Sparkles className="h-5 w-5" />,
    },
    "first-shipment": {
      title: "Generate Export Checklist",
      description: "Get a complete document checklist for your first shipment: invoice, bill of lading, COO, and more.",
      cta: "Create Checklist",
      href: "/dashboard/checklist",
      icon: <Sparkles className="h-5 w-5" />,
    },
    scaling: {
      title: "Explore New Markets",
      description: "You're scaling. Discover new export opportunities and compare market tariffs with FTA advantages.",
      cta: "Compare Markets",
      href: "/dashboard/compare",
      icon: <Sparkles className="h-5 w-5" />,
    },
  };

  const action = actions[stage] || actions.planning;

  return (
    <div className="rounded-2xl bg-linear-to-br from-saffron-500/15 to-orange-500/10 border border-saffron-200/50 dark:border-saffron-500/30 p-6 ring-1 ring-saffron-500/10">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-saffron-100 text-saffron-600 dark:bg-saffron-500/20 dark:text-saffron-400">
          {action.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {action.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {action.description}
          </p>
          <Link
            href={action.href}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-saffron-700 dark:bg-saffron-500 dark:hover:bg-saffron-600"
          >
            {action.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created at correct path with no TypeScript errors
- [ ] Component exports cleanly
- [ ] Test: Import this component in dashboard/page.tsx (next task)

---

## TASK 2: Create ExportPipelineCard Component
**New File:** `frontend/components/dashboard/ExportPipelineCard.tsx`

### Purpose
Show a visual timeline of the export journey and highlight where the user currently is.

### Create New File
Create a new file at `frontend/components/dashboard/ExportPipelineCard.tsx`:

```typescript
"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

interface ExportPipelineCardProps {
  currentStage?: string;
}

export function ExportPipelineCard({ currentStage = "planning" }: ExportPipelineCardProps) {
  const stages = [
    { id: "planning", label: "Planning", description: "Assess & prepare" },
    { id: "registered", label: "Registered", description: "Get IEC & compliance" },
    { id: "first-shipment", label: "First Shipment", description: "Execute & document" },
    { id: "scaling", label: "Scaling", description: "Expand & optimize" },
  ];

  const stageOrder = ["planning", "registered", "first-shipment", "scaling"];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Your Export Journey
      </h3>

      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isNext = idx === currentIndex + 1;

          return (
            <div key={stage.id} className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div className="relative mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: isComplete || isCurrent ? "#FF9933" : "#E4E4E7",
                  backgroundColor: isComplete || isCurrent ? "#FF9933" : "transparent",
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <Circle className={cn("h-5 w-5", isCurrent ? "text-saffron-600 dark:text-saffron-400" : "text-zinc-300 dark:text-zinc-600")} />
                )}
              </div>

              {/* Label */}
              <p className={cn("text-[11px] font-semibold uppercase tracking-wider", isComplete || isCurrent ? "text-saffron-600 dark:text-saffron-400" : "text-zinc-500 dark:text-zinc-400")}>
                {stage.label}
              </p>

              {/* Description */}
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center mt-0.5">
                {stage.description}
              </p>

              {/* Connector line */}
              {idx < stages.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+20px)] h-0.5 w-[calc(100vw/4-20px)] max-w-20"
                  style={{
                    backgroundColor: isComplete || (isCurrent && isNext) ? "#FF9933" : "#E4E4E7",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created at correct path with no TypeScript errors
- [ ] Component renders timeline correctly
- [ ] Test: Import in dashboard/page.tsx


---

## TASK 3: Create MarketSnapshotCard Component
**New File:** `frontend/components/dashboard/MarketSnapshotCard.tsx`

### Purpose
Display top 3–5 target markets with FTA status and quick tariff info.

### Create New File
Create `frontend/components/dashboard/MarketSnapshotCard.tsx`:

```typescript
"use client";

import Link from "next/link";
import { Globe2, TrendingUp } from "lucide-react";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";

interface MarketSnapshotCardProps {
  targetMarkets?: string[];
}

export function MarketSnapshotCard({ targetMarkets = ["AE", "SG", "US"] }: MarketSnapshotCardProps) {
  const markets = TOP_EXPORT_DESTINATIONS.filter((d) =>
    targetMarkets.includes(d.code)
  ).slice(0, 5);

  if (markets.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Market Snapshot
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Add target markets to your profile to see market insights.
        </p>
        <Link href="/settings" className="mt-3 inline-flex text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400">
          Update Profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 className="h-5 w-5 text-saffron-600 dark:text-saffron-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Market Snapshot
        </h3>
      </div>

      <div className="space-y-3">
        {markets.map((market) => (
          <Link
            key={market.code}
            href={`/dashboard/countries?market=${market.code}`}
            className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 transition-colors hover:bg-saffron-50 dark:bg-zinc-800 dark:hover:bg-saffron-500/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{market.flag}</span>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {market.name}
                </p>
                {market.ftaWithIndia && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {market.ftaWithIndia} ✓
                  </p>
                )}
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard/countries"
        className="mt-4 block text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400"
      >
        Explore all markets →
      </Link>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created with no TypeScript errors
- [ ] Component displays markets from exported destinations data
- [ ] Test: Import in dashboard/page.tsx

---

## TASK 4: Update Dashboard Page to Use New Cards
**File:** `frontend/app/(dashboard)/dashboard/page.tsx`

### Step 4A: Add Imports

**Find the imports section at the top:**
```typescript
import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  // ... other imports
```

**Add these new imports after the existing component imports:**
```typescript
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { ExportPipelineCard } from "@/components/dashboard/ExportPipelineCard";
import { MarketSnapshotCard } from "@/components/dashboard/MarketSnapshotCard";
```

### Step 4B: Add New Cards to Dashboard Output

**Find the section in the `DashboardPage` function that renders quick stats:**
```typescript
        {/* Quick stats */}
        <div className="mt-6">
          <QuickStats />
        </div>

        {/* Export tip banner */}
        <div className="mt-6">
          <ExportTipBanner />
        </div>
```

**Replace it with:**
```typescript
        {/* Next Best Action — personalized based on stage */}
        <div className="mt-6">
          <NextActionCard stage={profile.exportStage || "planning"} readinessScore={profile.readinessScore || 0} />
        </div>

        {/* Quick stats */}
        <div className="mt-6">
          <QuickStats />
        </div>

        {/* Export tip banner */}
        <div className="mt-6">
          <ExportTipBanner />
        </div>

        {/* Export Pipeline Timeline */}
        <div className="mt-8">
          <ExportPipelineCard currentStage={profile.exportStage || "planning"} />
        </div>

        {/* Market Snapshot */}
        <div className="mt-8">
          <MarketSnapshotCard targetMarkets={(profile as any).targetMarkets || ["AE", "SG", "US"]} />
        </div>
```

### Step 4C: Import useUserStore in Dashboard

**Find the exports/imports section or the export default function:**
```typescript
const sectors = [
  { emoji: "🧵", title: "Textiles & apparel" },
  // ...
];

export default function DashboardPage() {
  return (
```

**Add this inside the DashboardPage function, at the very top:**
```typescript
export default function DashboardPage() {
  const profile = useUserStore((s) => s.profile);

  return (
```

**And add the import at the top of the file:**
```typescript
import { useUserStore } from "@/store/user";
```

### After Completing Step 4
- [ ] Dashboard page imports all 3 new components
- [ ] New cards render on dashboard
- [ ] Test: `npm run dev` and navigate to `/dashboard`
- [ ] Should see Next Action card, Pipeline timeline, and Market Snapshot

---

## TASK 5: Create ExportRoadmapCard Component (Optional but Recommended)
**New File:** `frontend/components/dashboard/ExportRoadmapCard.tsx`

### Purpose
Show suggested milestones for the next stage with time estimates.

### Create New File
Create `frontend/components/dashboard/ExportRoadmapCard.tsx`:

```typescript
"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

interface ExportRoadmapCardProps {
  currentStage?: string;
}

export function ExportRoadmapCard({ currentStage = "planning" }: ExportRoadmapCardProps) {
  type RoadmapStage = {
    stage: string;
    tasks: Array<{ task: string; time: string; link: string }>;
  };

  const roadmaps: Record<string, RoadmapStage> = {
    planning: {
      stage: "planning",
      tasks: [
        { task: "Take Readiness Score", time: "6 min", link: "/dashboard/readiness" },
        { task: "Research Your Market", time: "15 min", link: "/dashboard/research" },
        { task: "Check HS Codes", time: "5 min", link: "/dashboard/hs-codes" },
      ],
    },
    registered: {
      stage: "registered",
      tasks: [
        { task: "Match Export Schemes", time: "5 min", link: "/dashboard/schemes/wizard" },
        { task: "Generate Checklist", time: "3 min", link: "/dashboard/checklist" },
        { task: "Calculate FTA Savings", time: "4 min", link: "/dashboard/fta" },
      ],
    },
    "first-shipment": {
      stage: "first-shipment",
      tasks: [
        { task: "Verify All Documents", time: "10 min", link: "/dashboard/checklist" },
        { task: "Confirm Tariff Rates", time: "5 min", link: "/dashboard/fta" },
        { task: "Review Compliance", time: "8 min", link: "/dashboard/chat" },
      ],
    },
    scaling: {
      stage: "scaling",
      tasks: [
        { task: "Explore New Markets", time: "10 min", link: "/dashboard/compare" },
        { task: "Optimize Pricing", time: "5 min", link: "/dashboard/pricing" },
        { task: "Update Schemes", time: "5 min", link: "/dashboard/schemes" },
      ],
    },
  };

  const roadmap = roadmaps[currentStage] || roadmaps.planning;

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Next Steps Roadmap
      </h3>

      <div className="space-y-2">
        {roadmap.tasks.map((item, idx) => (
          <Link
            key={idx}
            href={item.link}
            className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 transition-colors hover:bg-saffron-50 dark:bg-zinc-800 dark:hover:bg-saffron-500/10"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-saffron-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {item.task}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3 w-3" />
              {item.time}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Add to Dashboard

**In dashboard/page.tsx, after the Market Snapshot card, add:**
```typescript
        {/* Export Roadmap */}
        <div className="mt-8">
          <ExportRoadmapCard currentStage={profile.exportStage || "planning"} />
        </div>
```

**And add this import at the top:**
```typescript
import { ExportRoadmapCard } from "@/components/dashboard/ExportRoadmapCard";
```

---

## VERIFICATION CHECKLIST

After completing all tasks:

### Visual / Browser Tests
- [ ] Dashboard loads at `/dashboard`
- [ ] "Next Action" card appears at top (personalized to stage)
- [ ] "Export Pipeline" timeline shows current stage highlighted
- [ ] "Market Snapshot" shows target markets with FTA badges
- [ ] "Next Steps Roadmap" appears with time estimates
- [ ] All cards are responsive on mobile
- [ ] No console errors

### Functionality Tests
- [ ] Click CTA in "Next Action" → navigates to correct page
- [ ] Click market card → navigates to country profile
- [ ] Click roadmap task → navigates to relevant tool
- [ ] Change export stage in settings → dashboard updates automatically

### State & Persistence
- [ ] Refresh page (Cmd+R)
- [ ] Cards still render correctly
- [ ] User profile data persists

---

## COMMON ISSUES & FIXES

### Issue: "Cannot find module 'NextActionCard'"
**Fix:** Ensure file is at `frontend/components/dashboard/NextActionCard.tsx` (not dashboard folder)

### Issue: Pipeline timeline shows wrong stage
**Fix:** Make sure you're passing `currentStage={profile.exportStage}` from useUserStore

### Issue: Market cards don't show
**Fix:** Check that target markets are set in user profile. Use fallback: `targetMarkets={["AE", "SG", "US"]}`

### Issue: Components don't update when profile changes
**Fix:** Make sure useUserStore is imported and called at top of DashboardPage

---

## SUMMARY OF CHANGES

| Component | Type | Purpose |
|-----------|------|---------|
| `NextActionCard.tsx` | New | Show one actionable task per stage |
| `ExportPipelineCard.tsx` | New | Visual timeline of export journey |
| `MarketSnapshotCard.tsx` | New | Display target markets with FTA status |
| `ExportRoadmapCard.tsx` | New | Show suggested tasks + time estimates |
| `dashboard/page.tsx` | Modified | Add imports + render new cards |

**Total new code:** ~400 lines  
**Complexity:** Medium  
**Risk:** Low (no breaking changes)

---

## NEXT STEPS

After Phase 2 is complete:
1. Test all new cards on desktop and mobile
2. Try changing export stage in settings — should see dashboard update
3. Verify all CTAs navigate correctly
4. Move to **Phase 3** (Chat stores + persistence)

---

**Ready to execute Phase 2?** 🚀

