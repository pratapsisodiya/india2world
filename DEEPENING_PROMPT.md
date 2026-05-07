# India2World Frontend Deepening Prompt
## Phased Implementation Guide for Claude AI Agent

Execute these phases in order. Each phase is independent and testable.

---

## PHASE 1: Shell & Root Wiring
**Goal:** Make the app shell feel like a real workspace platform.
**Time:** ~30 mins

### 1.1 Upgrade Root Layout
**File:** `frontend/app/layout.tsx`

**Changes:**
- Upgrade metadata: richer `title`, `description`, `openGraph` properties
- Add `icons` for favicon
- Add `viewport` metadata for proper mobile scaling
- Consider adding a global notification provider hook (optional, skip if no toast system exists)
- Add `robots` meta for SEO
- Keep ThemeProvider as is

**Example fields to add:**
```typescript
export const metadata: Metadata = {
  title: "India2World — Your AI-Powered Export Command Center",
  description: "Plan, comply, and scale your exports with intelligent guidance on HS codes, FTA savings, government schemes, and market intelligence.",
  keywords: "export, DGFT, HS codes, FTA, government schemes, compliance, India",
  authors: [{ name: "India2World", url: "https://india2world.co" }],
  robots: "index, follow",
  openGraph: {
    title: "India2World — AI Export Guidance Platform",
    description: "Turn Indian products global with AI-powered export procedures, scheme matching, and market intelligence.",
    type: "website",
    locale: "en_IN",
  },
};
```

### 1.2 Deepen Header Navigation
**File:** `frontend/components/layout/Header.tsx`

**Changes:**
- Add a "Recent Activity" quick shortcut in the user menu (show last 3 recent items)
- Add a "Saved Items" indicator showing count
- Improve the command palette trigger visibility (Cmd+K)
- Add a subtle "export update" indicator if unread news/scheme updates exist
- Surface "Resume Chat" link if user has recent conversations

**Key functions to add:**
- `useRecentActivity()` — fetch last 3 items from activity store
- `useSavedCount()` — fetch count of saved items
- Add link to `/dashboard/saved` or `/dashboard/research` in the user menu

### 1.3 Expand Sidebar as Control Panel
**File:** `frontend/components/layout/Sidebar.tsx`

**Changes:**
- Add a "Recent Work" collapsible section at the top (show last 2–3 accessed tools)
- Improve the profile card:
  - Show next recommended action if available
  - Display target market count if set
  - Show "Export Stage Progress" more prominently
- Add a subtle "Quick Jump" section for saved items or research
- Make the sidebar feel like a command center, not just a menu

**New UI sections:**
- Recent work (auto-populated from activity store)
- Profile card (expanded with stage + next action)
- AI Tools (keep current)
- Reference (keep current)
- Account (keep current)

---

## PHASE 2: Dashboard Intelligence & Personalization
**Goal:** Turn the dashboard into a real export command center.
**Time:** ~45 mins

### 2.1 Upgrade Dashboard Page
**File:** `frontend/app/(dashboard)/dashboard/page.tsx`

**Changes:**
- Add a "Next Best Action" card at the top (driven by user stage + readiness)
- Add an "Export Pipeline" card showing where the user is in the export journey
- Add a "Market Snapshot" card highlighting top target markets
- Add a "Compliance Progress" card showing which export tasks are complete
- Reorder cards so the most relevant to the user's stage appears first
- Add personalization logic based on `profile.exportStage` and `profile.targetMarkets`

**New card components:**
1. `NextActionCard` — shows one actionable task based on stage
2. `ExportPipelineCard` — visual timeline of planning → registered → first-shipment → scaling
3. `MarketSnapshotCard` — shows target markets + FTA status
4. `ComplianceTrackerCard` — shows readiness progress

**Data to use:**
- `profile.exportStage` (planning, registered, first-shipment, scaling)
- `profile.readinessScore` (0–100)
- `profile.targetMarkets` (array of country codes)
- `activity.entries` (to show recent work)

### 2.2 Add Export Roadmap Feature
**File:** Create `frontend/components/dashboard/ExportRoadmapCard.tsx`

**Purpose:**
Show the user a visual journey from their current stage to scaling.

**Display:**
- Timeline: Planning → Registered → First Shipment → Scaling
- Highlight current stage
- Show 1–2 suggested tasks for the next stage
- Make it actionable (link to relevant tool for next step)

**Example:**
```
Current Stage: Planning
→ Step 1: Take Readiness Score (3 min)
→ Step 2: Match Your Schemes (5 min)
→ Next: Register & Get IEC (dashboard/research)
```

### 2.3 Create Market Intelligence Section
**File:** Update `frontend/app/(dashboard)/dashboard/page.tsx`

**Changes:**
- Add a "Market Opportunities" card showing:
  - Top 5 countries by FTA advantage
  - Quick tariff comparison
  - Compliance hotspots
- Use `exportDestinations.ts` data to enrich the display
- Make each market clickable → `/dashboard/countries?market=<code>` or `/dashboard/chat?q=Tell%20me%20about%20<country>`

---

## PHASE 3: Chat, Stores & Data Integration
**Goal:** Richer chat, better persistence, smarter suggestions.
**Time:** ~40 mins

### 3.1 Upgrade Chat Store
**File:** `frontend/store/chat.ts`

**Changes:**
- Add thread/session support:
  - `threads: ChatThread[]` — array of conversation threads
  - `currentThreadId: string | null`
  - `createThread()`, `switchThread()`, `deleteThread()`
- Add title/summary for each thread (auto-generate on first 2–3 messages)
- Add `pinned: boolean` for important conversations
- Preserve backward compatibility (migrate old flat message structure if needed)

**New types:**
```typescript
export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### 3.2 Enhance Chat Page
**File:** `frontend/app/(dashboard)/chat/page.tsx`

**Changes:**
- Add thread switcher / history sidebar
- Add "Save this conversation" button
- Add "Export as checklist" action (convert chat output to a downloadable list)
- Add suggested follow-up chips (e.g., "Tell me about tariffs", "Show me schemes", "Compare markets")
- Improve source display:
  - Show sources more prominently
  - Make each source clickable
  - Group sources by domain
- Add a "Summarize this conversation" button

**New UI components:**
- Thread history list
- Source card with better styling
- Follow-up suggestion chips
- Export/save actions

### 3.3 Expand Activity Store
**File:** `frontend/store/activity.ts`

**Changes:**
- Add more activity types:
  - `scheme-saved`, `country-viewed`, `chat-thread-created`, `milestone-completed`
- Add a `milestone` field for significant events (first readiness score, first chat, first scheme matched)
- Add `tags` to group related activities
- Add `favorite` / `pinned` boolean
- Keep deduplication logic

**New activity types:**
```typescript
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
  | "milestone-completed";
```

### 3.4 Deepen User Store & Settings
**File:** `frontend/store/user.ts` and `frontend/app/settings/page.tsx`

**Changes to store:**
- Add fields:
  - `targetMarkets: string[]` — array of country codes
  - `productCategories: string[]` — e.g., "textiles", "spices"
  - `preferredCurrency: string` — INR, USD, etc.
  - `complianceFocus: string[]` — e.g., "FSSAI", "CDSCO"
  - `hasIEC: boolean`
  - `isoVerified: boolean`
  - `onboardingComplete: boolean`

**Changes to settings page:**
- Add a form section for "Export Profile" with fields:
  - Business type (sole proprietor, partnership, etc.)
  - Target markets (multi-select from country list)
  - Export stage (planning, registered, first-shipment, scaling)
  - Readiness score (auto-populated, not editable here)
- Add "Compliance Requirements" section (checkboxes for FSSAI, CDSCO, ISO, etc.)
- Add "Preferred Currency" selector
- Make these changes populate the dashboard suggestions

---

## PHASE 4: Landing Page & Feature Depth
**Goal:** Stronger product narrative, deeper entry points.
**Time:** ~45 mins

### 4.1 Deepen Landing Page
**File:** `frontend/app/(public)/page.tsx` (in `LandingPage` export default)

**Changes:**
- Restructure "How It Works" section:
  - Rename to "Your Export Journey" or "Export Workflow"
  - Show realistic steps: *Assess Readiness → Find Schemes → Check HS Code → Calculate Tariffs → Generate Docs → Ship*
  - Add sub-descriptions and icons for each step
- Add a new "What You'll Build" section:
  - Export readiness profile
  - Market intelligence dashboard
  - Scheme eligibility records
  - Compliance checklist
  - Saved country profiles
- Add stronger CTA buttons:
  - "Start Exporting Free" (→ `/dashboard/readiness`)
  - "See Your Schemes" (→ `/dashboard/schemes/wizard`)
  - "Explore Markets" (→ `/dashboard/countries`)
- Add a "Sector Deep Dive" section showing 3–4 sectors with micro-stories
- Add a testimonial or proof point section (even if placeholder for now)

**New section ideas:**
```
✓ Assess Your Readiness (6 min)
✓ Find Matching Schemes (5 min)
✓ Verify HS Codes (2 min)
✓ Calculate FTA Savings (3 min)
✓ Generate Checklist (instant)
✓ Start Your First Shipment (you're ready!)
```

### 4.2 Add Saved Workspace Feature
**File:** Create `frontend/app/(dashboard)/saved/page.tsx` (or enhance if exists)

**Purpose:**
Single hub for all saved export intelligence: schemes, glossary terms, HS codes, market profiles, and chat snippets.

**Features:**
- Show saved items by category (tabs)
- Allow unsaving with one click
- Show when each item was saved
- Link to the relevant tool/context
- Allow search across saved items

**Components:**
- Tabs for: Schemes, Countries, HS Codes, Glossary, Chat Snippets
- Card for each saved item with: title, category, saved date, action link, delete button

### 4.3 Create Market Profiles Feature (Light)
**File:** Enhance or create `frontend/app/(dashboard)/countries/page.tsx`

**Purpose:**
Let users explore detailed country profiles including tariffs, FTA status, compliance, and AI insights.

**Display per country:**
- Basic info (flag, region, key stats)
- FTA status with India
- Tariff on top 3 Indian exports
- Key regulators and compliance notes
- Market size / demand signals
- "Ask AI about this market" button
- "Save this market" button

**Data source:**
- Use `exportDestinations.ts` and enrich with static data

---

## Execution Checklist

### Phase 1 (Shell & Navigation)
- [ ] Upgrade `app/layout.tsx` metadata
- [ ] Enhance `Header.tsx` with recent activity + saved count
- [ ] Expand `Sidebar.tsx` with recent work + improved profile card
- [ ] Test: navigation still works, no console errors

### Phase 2 (Dashboard Intelligence)
- [ ] Create `NextActionCard.tsx`, `ExportPipelineCard.tsx`, `MarketSnapshotCard.tsx`
- [ ] Update `dashboard/page.tsx` to use new cards + personalization logic
- [ ] Create `ExportRoadmapCard.tsx`
- [ ] Test: dashboard loads, personalization works, cards render

### Phase 3 (Chat & Stores)
- [ ] Upgrade `store/chat.ts` with thread support
- [ ] Update `ChatPage` to show thread history + suggested follow-ups
- [ ] Expand `store/activity.ts` with new activity types
- [ ] Enhance `store/user.ts` and `settings/page.tsx` with new profile fields
- [ ] Test: chat threading works, settings save, activity logs correctly

### Phase 4 (Landing & Workspace)
- [ ] Rewrite "How It Works" section in `(public)/page.tsx`
- [ ] Add new sections: "What You'll Build", deeper CTAs
- [ ] Create or enhance `saved/page.tsx` for saved workspace
- [ ] Create or enhance `countries/page.tsx` for market profiles
- [ ] Test: landing page loads, saved items work, country pages display

---

## Testing After Each Phase

1. **Browser test:** `npm run dev` and navigate all new/updated pages
2. **Mobile test:** Resize to mobile, check responsiveness
3. **State persistence:** Refresh page, verify chat/activity/user state persists
4. **No route breaks:** All old routes should still work
5. **Console clean:** No error logs or warnings

---

## Summary of New/Modified Files

### New files:
- `frontend/components/dashboard/NextActionCard.tsx`
- `frontend/components/dashboard/ExportPipelineCard.tsx`
- `frontend/components/dashboard/MarketSnapshotCard.tsx`
- `frontend/components/dashboard/ExportRoadmapCard.tsx`
- `frontend/app/(dashboard)/saved/page.tsx` (if not exists)
- `frontend/app/(dashboard)/countries/page.tsx` (if not exists)

### Modified files:
- `frontend/app/layout.tsx`
- `frontend/components/layout/Header.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/app/(dashboard)/chat/page.tsx`
- `frontend/store/chat.ts`
- `frontend/store/activity.ts`
- `frontend/store/user.ts`
- `frontend/app/settings/page.tsx`
- `frontend/app/(public)/page.tsx`

---

## Notes

- **Preserve existing:** Do not break current routes or UI.
- **Use existing data:** Leverage `exportDestinations.ts`, `hsCodes.ts`, `schemes.ts`, etc.
- **Keep responsive:** All new components should work on mobile + desktop.
- **Avoid placeholders:** Don't add UI that's non-functional.
- **Wire everything:** If you add a new route/component, ensure it's reachable from Header, Sidebar, or Dashboard.
- **Test state:** Verify Zustand stores persist correctly after page refresh.

---

## How to Use This Prompt

1. Copy this entire file or the phase description into Claude AI Code.
2. Paste this prompt and ask Claude to "Execute Phase 1", then test.
3. After Phase 1 passes, ask Claude to "Execute Phase 2", and so on.
4. After all 4 phases, ask Claude to "Do a final integration test and report any issues."

Good luck! 🚀
