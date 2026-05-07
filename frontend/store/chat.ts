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
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  tags?: string[];
}

interface ChatState {
  // Current conversation (active buffer)
  messages: ChatMessage[];
  lastSeenTs: number;

  // Saved conversation threads
  threads: ChatThread[];

  // Derived helpers
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistant: (content: string, toolCalls?: ChatToolCall[], sources?: ChatSource[]) => void;
  clearMessages: () => void;
  markSeen: () => void;

  // Thread management
  saveCurrentThread: (title?: string) => string | null;
  loadThread: (id: string) => void;
  deleteThread: (id: string) => void;
  pinThread: (id: string, pinned: boolean) => void;
  renameThread: (id: string, title: string) => void;
}

function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Untitled conversation";
  const text = first.content.trim();
  return text.length > 55 ? text.slice(0, 52) + "…" : text;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      lastSeenTs: 0,
      threads: [],

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      updateLastAssistant: (content, toolCalls, sources) =>
        set((s) => {
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          if (last?.role === "assistant") {
            msgs[msgs.length - 1] = {
              ...last,
              content,
              ...(toolCalls !== undefined && { toolCalls }),
              ...(sources !== undefined && { sources }),
            };
            return { messages: msgs };
          }
          return {};
        }),

      clearMessages: () => set({ messages: [], lastSeenTs: 0 }),

      markSeen: () => set({ lastSeenTs: Date.now() }),

      saveCurrentThread: (title) => {
        const { messages, threads } = get();
        if (messages.length === 0) return null;
        const id = crypto.randomUUID();
        const thread: ChatThread = {
          id,
          title: title ?? deriveTitle(messages),
          messages: [...messages],
          createdAt: messages[0]?.ts ?? Date.now(),
          updatedAt: Date.now(),
          pinned: false,
        };
        set({ threads: [thread, ...threads].slice(0, 30) });
        return id;
      },

      loadThread: (id) => {
        const thread = get().threads.find((t) => t.id === id);
        if (!thread) return;
        set({ messages: [...thread.messages], lastSeenTs: thread.updatedAt });
      },

      deleteThread: (id) =>
        set((s) => ({ threads: s.threads.filter((t) => t.id !== id) })),

      pinThread: (id, pinned) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === id ? { ...t, pinned } : t)),
        })),

      renameThread: (id, title) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === id ? { ...t, title } : t)),
        })),
    }),
    {
      name: "india2world-chat",
    }
  )
);
