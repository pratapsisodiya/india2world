"use client";

import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Sparkles, AlertCircle, Trash2, Send } from "lucide-react";
import { useUserStore } from "@/store/user";
import { AgentMessage, type AgentMessageData } from "@/components/setu-ai/AgentMessage";
import type { ToolCall } from "@/components/setu-ai/ToolStatus";
import type { Source } from "@/components/setu-ai/SourceList";

import { useSSE } from "@/hooks/useSSE";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const STARTER_PROMPTS = [
  "What is the latest RoDTEP rate notification from DGFT?",
  "What changed in India-UAE CEPA tariffs this month?",
  "Latest export news affecting Indian textile exporters",
  "Recent customs duty updates on pharma exports to USA",
];

export default function ResearchAgentPage() {
  const profile = useUserStore((s) => s.profile);
  const [messages, setMessages] = useState<AgentMessageData[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    startStream,
    stop: handleStop,
    streaming,
    buffer,
    toolCalls,
    sources,
    error,
    setError
  } = useSSE();

  const [activeMsgTs, setActiveMsgTs] = useState<number>(0);

  const activeMsg: AgentMessageData | null = useMemo(() => (
    streaming || buffer || toolCalls.length > 0 ? {
      id: "active",
      role: "assistant",
      content: buffer,
      toolCalls: toolCalls as ToolCall[],
      sources: sources as Source[],
      ts: activeMsgTs,
    } : null
  ), [streaming, buffer, toolCalls, sources, activeMsgTs]);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, activeMsg]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming) return;

      const userMsg: AgentMessageData = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setActiveMsgTs(Date.now());

      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await startStream(
        `${BACKEND_URL}/api/agent`,
        { messages: historyForApi },
        {
          onSuccess: (assistant, finalToolCalls, finalSources) => {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: assistant,
                toolCalls: finalToolCalls as ToolCall[],
                sources: finalSources as Source[],
                ts: Date.now(),
              },
            ]);
          },
          onError: () => {
             // original behaviour: discards partial content on error
          }
        }
      );
    },
    [messages, streaming, startStream]
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  const isEmpty = messages.length === 0 && !activeMsg;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-saffron-500" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Research Agent</p>
              <p className="text-[11px] text-zinc-400">
                AI with live web search · DGFT, news, latest export laws
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
          {isEmpty && (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <div className="relative">
                <div className="text-5xl">🌐</div>
                <Sparkles className="absolute -top-1 -right-2 h-5 w-5 text-saffron-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                  Research with Live Web Search
                </h1>
                <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  Ask about latest DGFT notifications, recent FTA updates, current scheme rates,
                  and breaking export news. The agent fetches sources in real time and cites them.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                {STARTER_PROMPTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full bg-white px-4 py-2 text-sm text-zinc-700 ring-1 ring-zinc-200 transition-colors hover:bg-saffron-50 hover:text-saffron-700 hover:ring-saffron-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-saffron-500/10 dark:hover:text-saffron-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 max-w-md">
                💡 Need quick answers without web search? Use{" "}
                <Link href="/dashboard/chat" className="font-semibold underline">/dashboard/chat</Link> instead.
              </div>
            </div>
          )}

          {messages.map((m) => (
            <AgentMessage key={m.id} msg={m} />
          ))}

          {activeMsg && <AgentMessage msg={activeMsg} streaming />}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {error.toLowerCase().includes("tavily") && (
                  <p className="mt-1 text-xs">
                    Get a free key at{" "}
                    <a
                      href="https://tavily.com"
                      target="_blank"
                      rel="noopener"
                      className="underline font-semibold"
                    >
                      tavily.com
                    </a>{" "}
                    and add to <code className="font-mono">backend/.env</code> as{" "}
                    <code className="font-mono">TAVILY_API_KEY=...</code>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl gap-2 px-4 py-3 sm:px-6"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              profile.sector
                ? `Ask the agent anything about ${profile.sector.toLowerCase()} exports…`
                : "Ask about latest export laws, DGFT notifications, news…"
            }
            disabled={streaming}
            className="flex-1 rounded-full border border-zinc-300 bg-white px-5 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-saffron-400 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
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
              className="inline-flex items-center gap-2 rounded-full bg-saffron-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-saffron-600 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Research
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
