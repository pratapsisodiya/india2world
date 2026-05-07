# PHASE 3: Chat, Stores & Data Integration — Detailed Execution Prompt
**For Claude AI Agent — Copy & Paste This Entire Prompt**

---

## OBJECTIVE
Deepen the chat system and stores to support:
1. Chat thread/session support with history
2. Richer activity tracking with new event types
3. Extended user profile with export-specific fields
4. Enhanced settings page for profile configuration

**Estimated Time:** ~50–70 minutes  
**Complexity:** Medium-High (store schema changes + UI wiring)  
**Testing:** After each store change, test persistence by refreshing

---

## TASK 1: Upgrade Chat Store with Thread Support
**File:** `frontend/store/chat.ts`

### Current State
The store currently has:
- Flat `messages: ChatMessage[]` array
- Simple `addMessage()`, `updateLastAssistant()`, `clearMessages()`
- No thread/session support

### What To Change
Add thread support while maintaining backward compatibility:
- `threads: ChatThread[]` — array of conversation threads
- `currentThreadId: string | null` — active thread
- New methods: `createThread()`, `switchThread()`, `deleteThread()`
- Auto-generate thread titles from first messages

### Exact Change

**Replace the entire file content with:**
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "user" | "assistant";

export interface ChatToolCall {
  id: string;
  tool: string;
  input: string;
  status: "running" | "done";
  resultCount?: number;
}

export interface ChatSource {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  ts: number;
  toolCalls?: ChatToolCall[];
  sources?: ChatSource[];
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  // Legacy support — for backward compatibility
  messages: ChatMessage[];
  lastSeenTs: number;

  // New thread-based system
  threads: ChatThread[];
  currentThreadId: string | null;

  // Legacy methods
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistant: (content: string) => void;
  clearMessages: () => void;
  markSeen: () => void;

  // New thread methods
  createThread: (title?: string) => string;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  pinThread: (threadId: string, pinned: boolean) => void;
  addMessageToThread: (threadId: string, msg: ChatMessage) => void;
  updateThreadMessage: (threadId: string, messageId: string, content: string) => void;
  getCurrentThread: () => ChatThread | null;
  generateThreadTitle: (threadId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      lastSeenTs: 0,
      threads: [],
      currentThreadId: null,

      // Legacy methods — still work but use current thread
      addMessage: (msg) =>
        set((s) => {
          const threadId = s.currentThreadId;
          if (threadId) {
            return {
              threads: s.threads.map((t) =>
                t.id === threadId
                  ? { ...t, messages: [...t.messages, msg], updatedAt: Date.now() }
                  : t
              ),
            };
          }
          // Fallback to flat messages if no thread
          return { messages: [...s.messages, msg] };
        }),

      updateLastAssistant: (content) =>
        set((s) => {
          const threadId = s.currentThreadId;
          if (threadId) {
            return {
              threads: s.threads.map((t) => {
                if (t.id === threadId) {
                  const msgs = [...t.messages];
                  const last = msgs[msgs.length - 1];
                  if (last?.role === "assistant") {
                    msgs[msgs.length - 1] = { ...last, content };
                  }
                  return { ...t, messages: msgs, updatedAt: Date.now() };
                }
                return t;
              }),
            };
          }
          // Fallback
          return {
            messages: s.messages.map((m, i, arr) =>
              i === arr.length - 1 && m.role === "assistant" ? { ...m, content } : m
            ),
          };
        }),

      clearMessages: () =>
        set((s) => {
          if (s.currentThreadId) {
            return {
              threads: s.threads.map((t) =>
                t.id === s.currentThreadId ? { ...t, messages: [], updatedAt: Date.now() } : t
              ),
            };
          }
          return { messages: [] };
        }),

      markSeen: () => set({ lastSeenTs: Date.now() }),

      // New thread methods
      createThread: (title) =>
        set((s) => {
          const newId = crypto.randomUUID();
          const newThread: ChatThread = {
            id: newId,
            title: title || `Chat ${new Date().toLocaleDateString()}`,
            messages: [],
            pinned: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return {
            threads: [newThread, ...s.threads],
            currentThreadId: newId,
          };
        }) || "",

      switchThread: (threadId) =>
        set((s) => ({
          currentThreadId: s.threads.find((t) => t.id === threadId) ? threadId : s.currentThreadId,
        })),

      deleteThread: (threadId) =>
        set((s) => {
          const remaining = s.threads.filter((t) => t.id !== threadId);
          return {
            threads: remaining,
            currentThreadId: s.currentThreadId === threadId ? (remaining[0]?.id || null) : s.currentThreadId,
          };
        }),

      pinThread: (threadId, pinned) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, pinned } : t)),
        })),

      addMessageToThread: (threadId, msg) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, msg], updatedAt: Date.now() }
              : t
          ),
        })),

      updateThreadMessage: (threadId, messageId, content) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) => (m.id === messageId ? { ...m, content } : m)),
                  updatedAt: Date.now(),
                }
              : t
          ),
        })),

      getCurrentThread: () => {
        const s = get();
        return s.threads.find((t) => t.id === s.currentThreadId) || null;
      },

      generateThreadTitle: (threadId) =>
        set((s) => {
          const thread = s.threads.find((t) => t.id === threadId);
          if (!thread || thread.messages.length < 2) return {};

          const firstUserMsg = thread.messages.find((m) => m.role === "user")?.content || "";
          const title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? "..." : "");

          return {
            threads: s.threads.map((t) => (t.id === threadId ? { ...t, title } : t)),
          };
        }),
    }),
    {
      name: "india2world-chat",
    }
  )
);
```

### After Completing This Task
- [ ] File saved with no TypeScript errors
- [ ] Test: `npm run dev` runs without errors
- [ ] Open DevTools → Application → LocalStorage → look for `india2world-chat` — should have data

---

## TASK 2: Expand Activity Store
**File:** `frontend/store/activity.ts`

### Current State
Flat activity tracking with one event type "chat", "readiness", etc.

### What To Change
Add more activity types and tracking fields for milestones.

**Replace the entire file with:**
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityKind =
  | "chat"
  | "chat-thread-created"
  | "readiness-completed"
  | "checklist-generated"
  | "fta-calculated"
  | "scheme-matched"
  | "scheme-saved"
  | "country-viewed"
  | "research-query"
  | "milestone-completed"
  | "hs-code-searched"
  | "glossary-viewed";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  label: string;
  href: string;
  ts: number;
  milestone?: string; // e.g., "first_chat", "first_readiness", "first_scheme"
  tags?: string[]; // e.g., ["schemes", "textile", "UAE"]
  pinned?: boolean;
}

interface ActivityState {
  entries: ActivityEntry[];
  milestones: string[]; // track significant events
  log: (entry: Omit<ActivityEntry, "id" | "ts">) => void;
  clear: () => void;
  getMilestones: () => string[];
  hasMilestone: (milestone: string) => boolean;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      entries: [],
      milestones: [],

      log: (entry) =>
        set((s) => {
          const next: ActivityEntry = {
            ...entry,
            id: crypto.randomUUID(),
            ts: Date.now(),
          };

          // Track milestones
          const newMilestones = [...s.milestones];
          if (entry.milestone && !s.milestones.includes(entry.milestone)) {
            newMilestones.push(entry.milestone);
          }

          // Deduplicate same href within last 5 min, keep latest 100
          const filtered = s.entries.filter(
            (e) => !(e.href === entry.href && Date.now() - e.ts < 300_000)
          );

          return {
            entries: [next, ...filtered].slice(0, 100),
            milestones: newMilestones,
          };
        }),

      clear: () => set({ entries: [], milestones: [] }),

      getMilestones: () => get().milestones,

      hasMilestone: (milestone: string) => get().milestones.includes(milestone),
    }),
    { name: "india2world-activity" }
  )
);
```

### After Completing This Task
- [ ] File saved with no TypeScript errors
- [ ] Test: `npm run dev` runs without errors

---

## TASK 3: Deepen User Store with Export Profile Fields
**File:** `frontend/store/user.ts`

### Current State
Basic user profile with businessName, email, sector, exportStage, readinessScore.

### What To Change
Add export-specific profile fields: target markets, product categories, compliance focus, etc.

**Find the entire file and replace it with:**
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  email: string;
  businessName?: string;
  sector?: string;
  exportStage?: "planning" | "registered" | "first-shipment" | "scaling";
  readinessScore?: number;

  // New fields
  businessType?: string; // sole proprietor, partnership, pvt ltd, etc.
  targetMarkets?: string[]; // array of country codes
  productCategories?: string[]; // e.g., ["textiles", "spices"]
  preferredCurrency?: string; // INR, USD, etc.
  complianceFocus?: string[]; // e.g., ["FSSAI", "CDSCO", "ISO"]
  hasIEC?: boolean;
  isoVerified?: boolean;
  onboardingComplete?: boolean;
}

interface UserState {
  profile: UserProfile;
  login: (email: string, businessName?: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const defaultProfile: UserProfile = {
  email: "",
  businessName: undefined,
  sector: undefined,
  exportStage: "planning",
  readinessScore: undefined,
  targetMarkets: [],
  productCategories: [],
  preferredCurrency: "INR",
  complianceFocus: [],
  hasIEC: false,
  isoVerified: false,
  onboardingComplete: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      login: (email, businessName) =>
        set((s) => ({
          profile: {
            ...s.profile,
            email,
            businessName: businessName || s.profile.businessName,
          },
        })),

      updateProfile: (updates) =>
        set((s) => ({
          profile: { ...s.profile, ...updates },
        })),

      logout: () => set({ profile: defaultProfile }),
    }),
    {
      name: "india2world-user",
    }
  )
);
```

### After Completing This Task
- [ ] File saved with no TypeScript errors
- [ ] Test: `npm run dev` runs without errors

---

## TASK 4: Enhance Settings Page with Export Profile Form
**File:** `frontend/app/settings/page.tsx`

### Current State (Check if file exists)
If the file doesn't exist, create it. If it does, enhance it.

### What To Add
A form to edit:
- Business type
- Target markets (multi-select)
- Product categories
- Compliance requirements
- Preferred currency
- IEC status

### Create or Replace File

Create `frontend/app/settings/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user";
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";
import { ChevronDown, Save, AlertCircle } from "lucide-react";

const BUSINESS_TYPES = [
  "Sole Proprietor",
  "Partnership",
  "Private Limited (Pvt Ltd)",
  "Limited Liability Partnership (LLP)",
  "Public Limited Company",
  "Cooperative",
];

const PRODUCT_CATEGORIES = [
  "Textiles & Apparel",
  "Spices & Agriculture",
  "Pharmaceuticals",
  "Gems & Jewellery",
  "Engineering Goods",
  "Leather & Footwear",
  "IT & Software Services",
  "Handicrafts",
];

const COMPLIANCE_REQUIREMENTS = [
  { value: "FSSAI", label: "FSSAI (Food Products)" },
  { value: "CDSCO", label: "CDSCO (Pharma)" },
  { value: "ISO", label: "ISO Certification" },
  { value: "BIS", label: "BIS (Indian Standards)" },
  { value: "EPCG", label: "EPCG Scheme" },
  { value: "EU_REACH", label: "EU REACH Compliance" },
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

export default function SettingsPage() {
  const { profile, updateProfile } = useUserStore();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    businessName: profile.businessName || "",
    businessType: profile.businessType || "",
    sector: profile.sector || "",
    exportStage: profile.exportStage || "planning",
    targetMarkets: profile.targetMarkets || [],
    productCategories: profile.productCategories || [],
    preferredCurrency: profile.preferredCurrency || "INR",
    complianceFocus: profile.complianceFocus || [],
    hasIEC: profile.hasIEC || false,
    isoVerified: profile.isoVerified || false,
  });

  const handleSave = () => {
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleTargetMarket = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(code)
        ? prev.targetMarkets.filter((c) => c !== code)
        : [...prev.targetMarkets, code],
    }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      productCategories: prev.productCategories.includes(cat)
        ? prev.productCategories.filter((c) => c !== cat)
        : [...prev.productCategories, cat],
    }));
  };

  const toggleCompliance = (comp: string) => {
    setFormData((prev) => ({
      ...prev,
      complianceFocus: prev.complianceFocus.includes(comp)
        ? prev.complianceFocus.filter((c) => c !== comp)
        : [...prev.complianceFocus, comp],
    }));
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Export Profile Settings
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Configure your export business profile to get personalized guidance and recommendations.
        </p>

        {saved && (
          <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-500/10 dark:border-emerald-500/30">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ✓ Profile saved successfully
            </p>
          </div>
        )}

        {/* Basic Info Section */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Basic Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Business Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Sector
              </label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="e.g., Textiles, Spices, Pharma"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Export Stage
              </label>
              <select
                value={formData.exportStage}
                onChange={(e) => setFormData({ ...formData, exportStage: e.target.value as any })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="planning">Planning</option>
                <option value="registered">Registered (IEC obtained)</option>
                <option value="first-shipment">First Shipment</option>
                <option value="scaling">Scaling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Preferred Currency
              </label>
              <select
                value={formData.preferredCurrency}
                onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Markets Section */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Target Markets
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select the countries you plan to export to (top 10 destinations)
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TOP_EXPORT_DESTINATIONS.slice(0, 10).map((dest) => (
              <label key={dest.code} className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.targetMarkets.includes(dest.code)}
                  onChange={() => toggleTargetMarket(dest.code)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {dest.flag} {dest.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Categories Section */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Product Categories
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            What do you export or plan to export?
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.productCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Compliance Section */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Compliance Requirements
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Which compliance certifications are relevant to your business?
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {COMPLIANCE_REQUIREMENTS.map((req) => (
              <label key={req.value} className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.complianceFocus.includes(req.value)}
                  onChange={() => toggleCompliance(req.value)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{req.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Checkboxes */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Business Status
          </h2>

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={formData.hasIEC}
                onChange={(e) => setFormData({ ...formData, hasIEC: e.target.checked })}
                className="rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                I have an IEC (Import-Export Code)
              </span>
            </label>

            <label className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={formData.isoVerified}
                onChange={(e) => setFormData({ ...formData, isoVerified: e.target.checked })}
                className="rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Our company has ISO certification
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-saffron-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-700 dark:bg-saffron-500 dark:hover:bg-saffron-600"
          >
            <Save className="h-4 w-4" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
```

### After Completing This Task
- [ ] File created or replaced at `frontend/app/settings/page.tsx`
- [ ] No TypeScript errors
- [ ] Test: `npm run dev` and navigate to `/settings`
- [ ] Fill form and click "Save Profile" — should persist in Zustand store

---

## TASK 5: Update Header to Show Settings Link
**File:** `frontend/components/layout/Header.tsx`

### Step 5A: Add Settings Link to User Menu

**Find the user menu section (look for the "Settings" Link):**
```typescript
          <Link href="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Settings className="h-4 w-4" /> Settings
          </Link>
```

**Verify it exists — if not, add it before the "Sign out" button in the user menu.**

---

## TASK 6: Update Chat Page to Use Thread Support (Optional but Recommended)
**File:** `frontend/app/(dashboard)/chat/page.tsx`

### This is a complex task — do this ONLY if you have 30+ mins

**Summary of changes:**
- Add a thread history sidebar showing recent threads
- Add "New Chat" button to create thread
- Add ability to switch threads
- Display current thread title in header

**Due to complexity, this task is optional for Phase 3.** You can skip it and proceed to Phase 4 if time is limited. The chat will still work with the upgraded store.

---

## VERIFICATION CHECKLIST

After completing Tasks 1–5:

### Store & Persistence Tests
- [ ] `npm run dev` runs without errors
- [ ] Open DevTools → Application → LocalStorage
  - [ ] `india2world-chat` has thread data
  - [ ] `india2world-activity` has expanded activity types
  - [ ] `india2world-user` has new profile fields
- [ ] Refresh page — all data persists
- [ ] Navigate to `/settings` — form loads with current data
- [ ] Fill form and click Save — data updates in store
- [ ] Refresh settings page — filled form still shows (data persisted)

### Functional Tests
- [ ] Sidebar/Header still works with extended user profile
- [ ] Dashboard cards render with new user fields
- [ ] No console errors or TypeScript issues

---

## COMMON ISSUES & FIXES

### Issue: "Cannot find module 'TOP_EXPORT_DESTINATIONS'"
**Fix:** Make sure this import exists in settings/page.tsx:
```typescript
import { TOP_EXPORT_DESTINATIONS } from "@/app/data/exportDestinations";
```

### Issue: Settings page doesn't save
**Fix:** Make sure `updateProfile()` is called in the handle Save function and the store is properly imported

### Issue: Profile changes don't show in header/sidebar
**Fix:** Components must use `useUserStore()` hook at the top to subscribe to changes

### Issue: Activity entries don't have milestone field
**Fix:** When logging activity, pass `milestone: "first_chat"` in the entry object

---

## SUMMARY OF CHANGES

| File | Changes | Impact |
|------|---------|--------|
| `store/chat.ts` | Add thread support | Chat can have multiple conversations |
| `store/activity.ts` | Add more event types + milestones | Richer activity tracking |
| `store/user.ts` | Add export profile fields | Personalization possible |
| `app/settings/page.tsx` | New settings form | Users can configure profile |
| `components/layout/Header.tsx` | Verify Settings link | Navigation to settings |

**Total new code:** ~500 lines  
**Complexity:** Medium-High  
**Risk:** Low (all changes are backward-compatible)

---

## NEXT STEPS

After Phase 3:
1. Test all store persistence
2. Fill out settings form completely
3. Verify dashboard updates based on new profile data
4. Move to **Phase 4** (Landing page + Saved workspace feature)

---

**Ready to execute Phase 3?** 🚀

