"use client";

import { Loader2, CheckCircle2, Search, Newspaper } from "lucide-react";

export interface ToolCall {
  id: string;
  tool: string;
  input: string;
  status: "running" | "done";
  resultCount?: number;
}

const TOOL_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  web_search: {
    icon: Search,
    label: "Web search",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
  },
  news_search: {
    icon: Newspaper,
    label: "News search",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30",
  },
};

export function ToolStatus({ call }: { call: ToolCall }) {
  const meta = TOOL_META[call.tool] ?? {
    icon: Search,
    label: call.tool,
    color: "text-zinc-500 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
  };
  const Icon = meta.icon;
  const running = call.status === "running";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${meta.color}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium">{meta.label}:</span>
      <span className="max-w-[280px] truncate">{call.input || "…"}</span>
      {running ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      ) : (
        <span className="flex items-center gap-1 text-[11px] opacity-80">
          <CheckCircle2 className="h-3 w-3" />
          {call.resultCount ?? 0}
        </span>
      )}
    </div>
  );
}

export function ToolStatusList({ calls }: { calls: ToolCall[] }) {
  if (calls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {calls.map((c) => (
        <ToolStatus key={c.id} call={c} />
      ))}
    </div>
  );
}
