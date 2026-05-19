"use client";

import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Copy, Check, X, Search, Download, Sparkles,
  Bookmark, BookmarkCheck, ChevronRight, MessageSquare,
  RotateCcw, PlusCircle, Clock, Pin,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import { useChatStore, ChatMessage, ChatThread } from "@/store/chat";
import { useActivityStore } from "@/store/activity";
import { useSavedStore } from "@/store/saved";
import { AgentMessage, type AgentMessageData } from "@/components/setu-ai/AgentMessage";
import { useSSE } from "@/hooks/useSSE";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const DEFAULT_STARTER_SUGGESTIONS = [
  "How do I get an IEC code?",
  "What is RoDTEP and am I eligible?",
  "Which countries buy Indian handicrafts?",
  "HS code for handwoven cotton sarees?",
];

const SECTOR_SUGGESTIONS: Record<string, string[]> = {
  "Textiles & Apparel": [
    "What is RoSCTL and how do I claim it?",
    "Which EU countries buy Indian textiles most?",
    "HS codes for knitted cotton garments?",
    "RCMC from Apparel Export Promotion Council — steps?",
  ],
  "Spices & Agriculture": [
    "How do I get a Spices Board RCMC?",
    "What documents do I need to export spices to UAE?",
    "Is RoDTEP available for spice exports?",
    "HS code for black pepper and turmeric?",
  ],
  Pharmaceuticals: [
    "Do I need CDSCO NOC to export medicines?",
    "Which countries have MRA with India for pharma?",
    "HS code for pharmaceutical formulations?",
    "How does Advance Authorisation work for API imports?",
  ],
  "Gems & Jewellery": [
    "RCMC from GJEPC — how to apply?",
    "What is the duty drawback rate for gold jewellery?",
    "Export procedure for diamonds to UAE?",
    "HS code for silver jewellery?",
  ],
  "Engineering Goods": [
    "EPCG licence — how does it work?",
    "Which FTAs reduce duty on Indian engineering goods?",
    "HS code for auto components?",
    "How to get BIS certification for export?",
  ],
};

// Follow-up suggestion chips shown after each AI response
const FOLLOW_UPS: Record<string, string[]> = {
  iec: ["How long does IEC take?", "What documents do I need for IEC?", "Can I export without IEC?"],
  rodtep: ["What is the RoDTEP rate for my product?", "How to claim RoDTEP scrip?", "Is RoDTEP available for all exporters?"],
  hs: ["How to find the exact HS sub-heading?", "What happens if I use wrong HS code?", "Does HS code affect my duty rates?"],
  fta: ["Which FTAs cover my product?", "How to get Certificate of Origin?", "What is CEPA and how does it help?"],
  scheme: ["How do I claim this scheme?", "What documents do I need to apply?", "Is there a deadline to claim?"],
  default: ["Tell me more", "What are the next steps?", "Are there any exemptions?", "What documents do I need?"],
};

function getFollowUpChips(content: string): string[] {
  const lower = content.toLowerCase();
  if (lower.includes("iec")) return FOLLOW_UPS.iec;
  if (lower.includes("rodtep") || lower.includes("ro-dtep")) return FOLLOW_UPS.rodtep;
  if (lower.includes("hs code") || lower.includes("itc-hs")) return FOLLOW_UPS.hs;
  if (lower.includes("fta") || lower.includes("cepa") || lower.includes("free trade")) return FOLLOW_UPS.fta;
  if (lower.includes("scheme") || lower.includes("epcg") || lower.includes("drawback")) return FOLLOW_UPS.scheme;
  return FOLLOW_UPS.default;
}

function getDynamicSuggestions(profile: {
  sector: string;
  exportStage: string;
  targetMarkets: string[];
}): string[] {
  const sectorSuggestions = SECTOR_SUGGESTIONS[profile.sector];
  if (sectorSuggestions) {
    const base = [...sectorSuggestions.slice(0, 2)];
    if (profile.exportStage === "planning")
      base.push("What registrations do I need to start exporting?");
    else if (profile.exportStage === "registered")
      base.push("How do I find my first overseas buyer?");
    else if (profile.exportStage === "first-shipment")
      base.push("How do I file a shipping bill on ICEGATE?");
    else if (profile.exportStage === "scaling")
      base.push("How can I expand to new markets with my existing IEC?");
    if (profile.targetMarkets.length)
      base.push(`What documents do I need to export to ${profile.targetMarkets[0]}?`);
    return base.slice(0, 4);
  }
  return DEFAULT_STARTER_SUGGESTIONS;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy message"
      className="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-zinc-400" />
      )}
    </button>
  );
}

function SaveAnswerButton({ content }: { content: string }) {
  const saveItem = useSavedStore((s) => s.saveItem);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveItem({
      type: "chat-answer",
      title: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
      body: content,
      tags: ["chat"],
      href: "/dashboard/chat",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      aria-label="Save answer to workspace"
      className="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      title="Save to workspace"
    >
      {saved ? (
        <BookmarkCheck className="h-3.5 w-3.5 text-saffron-500" />
      ) : (
        <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
      )}
    </button>
  );
}

function MessageBubble({
  msg,
  streaming,
  highlight,
  showFollowUps,
  onFollowUp,
}: {
  msg: ChatMessage;
  streaming?: boolean;
  highlight?: string;
  showFollowUps?: boolean;
  onFollowUp?: (text: string) => void;
}) {
  const isUser = msg.role === "user";

  function highlightText(text: string, query: string) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700">
          {p}
        </mark>
      ) : (
        p
      )
    );
  }

  const chips = showFollowUps && !streaming ? getFollowUpChips(msg.content) : [];

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-2`}>
      <div className="group relative max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-7 ${
            isUser
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">
              {highlight ? highlightText(msg.content, highlight) : msg.content}
            </span>
          ) : (
            <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-zinc-100 prose-pre:dark:bg-zinc-800 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
          {streaming && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          )}
        </div>
        {/* Action buttons */}
        {!isUser && !streaming && (
          <div className="absolute right-2 top-2 flex gap-0.5">
            <SaveAnswerButton content={msg.content} />
            <CopyButton text={msg.content} />
          </div>
        )}
        <p className="mt-1 px-1 text-[10px] text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
          {relativeTime(msg.ts)}
        </p>
      </div>

      {/* Follow-up chips */}
      {chips.length > 0 && onFollowUp && (
        <div className="flex flex-wrap gap-1.5 max-w-[85%]">
          {chips.slice(0, 3).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onFollowUp(chip)}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-saffron-300 hover:bg-saffron-50 hover:text-saffron-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-saffron-700 dark:hover:bg-saffron-900/20 dark:hover:text-saffron-400"
            >
              <ChevronRight className="h-2.5 w-2.5 shrink-0" />
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadItem({
  thread,
  onLoad,
  onPin,
  onDelete,
}: {
  thread: ChatThread;
  onLoad: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-start gap-1 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
      <button
        type="button"
        onClick={() => onLoad(thread.id)}
        className="flex-1 min-w-0 text-left"
      >
        <p className="line-clamp-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{thread.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-400">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          {relativeTime(thread.updatedAt)}
          <span>·</span>
          {thread.messages.length} msgs
        </p>
      </button>
      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onPin(thread.id, !thread.pinned)}
          className="rounded p-1 text-zinc-400 hover:text-saffron-500"
          title={thread.pinned ? "Unpin" : "Pin"}
        >
          <Pin className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(thread.id)}
          className="rounded p-1 text-zinc-400 hover:text-red-500"
          title="Delete"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ThreadList({
  threads,
  onLoad,
  onNew,
  onClose,
}: {
  threads: ChatThread[];
  onLoad: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}) {
  const pinThread = useChatStore((s) => s.pinThread);
  const deleteThread = useChatStore((s) => s.deleteThread);

  const pinned = threads.filter((t) => t.pinned);
  const recent = threads.filter((t) => !t.pinned).slice(0, 15);

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 w-64 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Conversations</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onNew}
            title="New conversation"
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {pinned.length > 0 && (
          <div className="mb-2">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pinned</p>
            {pinned.map((t) => (
              <ThreadItem key={t.id} thread={t} onLoad={onLoad} onPin={pinThread} onDelete={deleteThread} />
            ))}
          </div>
        )}
        {recent.length > 0 ? (
          <div>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Recent</p>
            {recent.map((t) => (
              <ThreadItem key={t.id} thread={t} onLoad={onLoad} onPin={pinThread} onDelete={deleteThread} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xs text-zinc-400">No saved conversations yet.</p>
            <p className="text-[10px] text-zinc-400">Use &quot;Save&quot; to archive chats.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const profile = useUserStore((s) => s.profile);
  const {
    messages, addMessage, clearMessages, markSeen,
    saveCurrentThread, loadThread, threads,
    pinThread, deleteThread,
  } = useChatStore();
  const logActivity = useActivityStore((s) => s.log);

  const starterSuggestions = profile.sector
    ? getDynamicSuggestions({
        sector: profile.sector,
        exportStage: profile.exportStage,
        targetMarkets: profile.targetMarkets,
      })
    : DEFAULT_STARTER_SUGGESTIONS;

  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [researchMode, setResearchMode] = useState(() => {
    try { return localStorage.getItem("india2world-research-mode") === "true"; } catch { return false; }
  });
  const [input, setInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showThreads, setShowThreads] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const autoSent = useRef(false);
  const initialQueryRef = useRef(initialQuery);

  const {
    startStream,
    stop: handleStop,
    streaming,
    buffer: assistantBuffer,
    toolCalls: activeToolCalls,
    sources: activeSources,
    error,
    setError,
  } = useSSE();

  useEffect(() => {
    localStorage.setItem("india2world-research-mode", String(researchMode));
  }, [researchMode]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [streamStartTs, setStreamStartTs] = useState(0);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, assistantBuffer]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        ts: Date.now(),
      };
      addMessage(userMsg);
      if (messages.length === 0) {
        logActivity({
          kind: "chat",
          label: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
          href: "/dashboard/chat",
        });
      }
      setInput("");
      setStreamStartTs(Date.now());

      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const endpoint = researchMode ? "/api/agent" : "/api/chat";
      const body = {
        provider,
        messages: historyForApi,
        userProfile: {
          businessName: profile.businessName,
          sector: profile.sector,
          location: profile.location,
          exportProducts: profile.exportProducts,
          targetMarkets: profile.targetMarkets,
          exportStage: profile.exportStage,
        },
      };

      await startStream(`${BACKEND_URL}${endpoint}`, body, {
        onSuccess: (assistant, toolCalls, sources) => {
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistant,
            ts: Date.now(),
            ...(toolCalls.length > 0 && { toolCalls }),
            ...(sources.length > 0 && { sources }),
          });
        },
        onError: (_err, partialContent) => {
          if (partialContent) {
            addMessage({
              id: crypto.randomUUID(),
              role: "assistant",
              content: partialContent,
              ts: Date.now(),
            });
          }
        },
      });
    },
    [messages, streaming, profile, provider, researchMode, logActivity, startStream, addMessage, setInput]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markSeen();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      markSeen();
    }
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [markSeen]);

  useEffect(() => {
    initialQueryRef.current = initialQuery;
  }, [initialQuery]);

  useEffect(() => {
    if (initialQueryRef.current && !autoSent.current && messages.length === 0) {
      autoSent.current = true;
      sendMessage(initialQueryRef.current);
    }
  }, [sendMessage, messages.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleSaveThread() {
    const id = saveCurrentThread();
    if (id) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  }

  function handleNewThread() {
    saveCurrentThread();
    clearMessages();
    setShowThreads(false);
  }

  function handleLoadThread(id: string) {
    loadThread(id);
    setShowThreads(false);
  }

  const isEmpty = messages.length === 0 && !assistantBuffer;
  const lastAssistant = messages.filter((m) => m.role === "assistant").at(-1);

  const displayMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-1 overflow-hidden">
      {showThreads && (
        <ThreadList
          threads={threads}
          onLoad={handleLoadThread}
          onNew={handleNewThread}
          onClose={() => setShowThreads(false)}
        />
      )}

      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 min-w-0">
        {searchOpen && (
          <div className="border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
              />
              {searchQuery && (
                <span className="text-xs text-zinc-400">
                  {displayMessages.length} result{displayMessages.length !== 1 ? "s" : ""}
                </span>
              )}
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="rounded p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">

            {messages.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowThreads((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  {threads.length > 0 ? `${threads.length} saved` : "Conversations"}
                </button>
                <div className="flex gap-1">
                  {savedNotice ? (
                    <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-india-green-600 dark:text-india-green-400">
                      <Check className="h-3 w-3" /> Saved!
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveThread}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                    >
                      <Bookmark className="h-3 w-3" /> Save
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const txt = messages.map((m) => `[${m.role.toUpperCase()}]\n${m.content}`).join("\n\n---\n\n");
                      const blob = new Blob([txt], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `india2world-chat-${new Date().toISOString().slice(0, 10)}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                  >
                    <Download className="h-3 w-3" /> Export
                  </button>
                  <button
                    type="button"
                    onClick={handleNewThread}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" /> New chat
                  </button>
                </div>
              </div>
            )}

            {isEmpty && (
              <div className="flex flex-col items-center gap-6 py-16 text-center">
                <div className="text-5xl">🇮🇳</div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                    Ask anything about exporting from India
                  </h1>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Procedures, target markets, govt schemes, HS codes — try a starter below.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {starterSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="rounded-full bg-white px-4 py-2 text-sm text-zinc-700 ring-1 ring-zinc-200 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {threads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowThreads(true)}
                    className="flex items-center gap-2 text-sm text-saffron-600 dark:text-saffron-400 hover:underline"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    View {threads.length} saved conversation{threads.length !== 1 ? "s" : ""}
                  </button>
                )}
                <p className="text-xs text-zinc-400">
                  <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">Ctrl+/</kbd> focus &nbsp;·&nbsp;
                  <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">Ctrl+F</kbd> search
                </p>
              </div>
            )}

            {displayMessages.map((m, i) => {
              const isLastAssistant = !streaming && m.id === lastAssistant?.id;
              return m.toolCalls || m.sources ? (
                <AgentMessage key={m.id} msg={m as AgentMessageData} />
              ) : (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  highlight={searchQuery || undefined}
                  showFollowUps={isLastAssistant && i === messages.length - 1}
                  onFollowUp={sendMessage}
                />
              );
            })}

            {(assistantBuffer || activeToolCalls.length > 0) &&
              (researchMode ? (
                <AgentMessage
                  msg={{
                    id: "__buffer__",
                    role: "assistant",
                    content: assistantBuffer,
                    ts: streamStartTs,
                    toolCalls: activeToolCalls,
                    sources: activeSources,
                  }}
                  streaming
                />
              ) : (
                <MessageBubble
                  msg={{
                    id: "__buffer__",
                    role: "assistant",
                    content: assistantBuffer,
                    ts: streamStartTs,
                  }}
                  streaming
                />
              ))}

            {streaming && !assistantBuffer && activeToolCalls.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
                {researchMode ? "Researching…" : "Thinking…"}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-4 pt-3 sm:px-6 flex-wrap">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              AI Model:
            </span>
            {(["openai", "gemini"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  provider === p
                    ? "bg-saffron-100 text-saffron-700 dark:bg-saffron-500/20 dark:text-saffron-300"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {p === "openai" ? "GPT-4o mini" : "Gemini"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setResearchMode((v) => !v)}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                researchMode
                  ? "bg-saffron-500 text-white shadow-sm shadow-saffron-500/30"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
              title="Enable web search via the LangGraph research agent"
            >
              <Sparkles className="h-3 w-3" />
              Research Mode
              {researchMode && <span className="ml-0.5 text-[10px] opacity-80">ON</span>}
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl gap-2 px-4 py-3 sm:px-6"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about export procedures, target countries, schemes, HS codes…"
                disabled={streaming}
                className="w-full rounded-full border border-zinc-300 bg-white px-5 py-3 pr-16 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              />
              {input.length > 0 && (
                <span className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums ${input.length > 280 ? "text-red-400" : "text-zinc-400"}`}>
                  {input.length}
                </span>
              )}
            </div>
            {streaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="rounded-full bg-zinc-200 px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatFallback() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-300" />
        Loading chat…
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatFallback />}>
      <ChatInner />
    </Suspense>
  );
}
