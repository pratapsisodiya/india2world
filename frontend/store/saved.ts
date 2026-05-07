import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedItemType =
  | "scheme"
  | "glossary"
  | "hs-code"
  | "country"
  | "chat-answer"
  | "market-note"
  | "checklist";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  body: string;
  tags: string[];
  ts: number;
  pinned: boolean;
  href?: string;
  meta?: Record<string, string>;
}

interface SavedState {
  items: SavedItem[];
  saveItem: (item: Omit<SavedItem, "id" | "ts" | "pinned">) => string;
  removeItem: (id: string) => void;
  pinItem: (id: string, pinned: boolean) => void;
  updateItem: (id: string, patch: Partial<Pick<SavedItem, "title" | "body" | "tags">>) => void;
  hasItem: (href: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],

      saveItem: (item) => {
        const id = crypto.randomUUID();
        const next: SavedItem = { ...item, id, ts: Date.now(), pinned: false };
        set((s) => ({ items: [next, ...s.items].slice(0, 200) }));
        return id;
      },

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      pinItem: (id, pinned) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, pinned } : i)),
        })),

      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      hasItem: (href) => get().items.some((i) => i.href === href),
    }),
    { name: "india2world-saved" }
  )
);
