import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityKind =
  | "chat"
  | "chat-thread-created"
  | "readiness"
  | "readiness-completed"
  | "checklist"
  | "checklist-generated"
  | "fta"
  | "fta-calculated"
  | "scheme-wizard"
  | "scheme-browse"
  | "scheme-matched"
  | "scheme-saved"
  | "hs-lookup"
  | "glossary"
  | "compare"
  | "pricing"
  | "countries"
  | "country-viewed"
  | "saved"
  | "research"
  | "research-query"
  | "updates"
  | "milestone-completed";

export type MilestoneKind =
  | "iec-registered"
  | "rcmc-obtained"
  | "first-shipment"
  | "first-payment"
  | "scheme-claimed"
  | "readiness-100";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  label: string;
  href: string;
  ts: number;
  pinned?: boolean;
  tags?: string[];
  milestone?: boolean;
}

export interface ExportMilestone {
  id: MilestoneKind;
  label: string;
  completedAt?: number;
}

const DEFAULT_MILESTONES: ExportMilestone[] = [
  { id: "iec-registered", label: "IEC Code registered" },
  { id: "rcmc-obtained", label: "RCMC obtained" },
  { id: "first-shipment", label: "First shipment dispatched" },
  { id: "first-payment", label: "First payment received" },
  { id: "scheme-claimed", label: "First government scheme claimed" },
  { id: "readiness-100", label: "Export readiness score 100%" },
];

interface ActivityState {
  entries: ActivityEntry[];
  milestones: ExportMilestone[];
  log: (entry: Omit<ActivityEntry, "id" | "ts">) => void;
  pin: (id: string, pinned: boolean) => void;
  clear: () => void;
  completeMilestone: (id: MilestoneKind) => void;
  resetMilestone: (id: MilestoneKind) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      entries: [],
      milestones: DEFAULT_MILESTONES,

      log: (entry) =>
        set((s) => {
          const next: ActivityEntry = {
            ...entry,
            id: crypto.randomUUID(),
            ts: Date.now(),
          };
          // Deduplicate same href within last 5 min, keep latest 50
          const filtered = s.entries.filter(
            (e) => !(e.href === entry.href && Date.now() - e.ts < 300_000)
          );
          return { entries: [next, ...filtered].slice(0, 50) };
        }),

      pin: (id, pinned) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, pinned } : e
          ),
        })),

      clear: () => set({ entries: [] }),

      completeMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, completedAt: Date.now() } : m
          ),
        })),

      resetMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, completedAt: undefined } : m
          ),
        })),
    }),
    {
      name: "india2world-activity",
      // Hydrate default milestones if store was created before milestones existed
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<ActivityState> | null;
        return {
          ...current,
          ...(p ?? {}),
          milestones:
            p && Array.isArray(p.milestones) && p.milestones.length > 0
              ? p.milestones
              : DEFAULT_MILESTONES,
        };
      },
    }
  )
);
