"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolStatusList, type ToolCall } from "./ToolStatus";
import { SourceList, type Source } from "./SourceList";

export interface AgentMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  sources?: Source[];
  ts: number;
}

export function AgentMessage({
  msg,
  streaming,
}: {
  msg: AgentMessageData;
  streaming?: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="group relative max-w-[90%] flex flex-col gap-3">
        {/* Tool calls (assistant only) */}
        {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
          <ToolStatusList calls={msg.toolCalls} />
        )}

        {/* Body */}
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-7 ${
            isUser
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : msg.content ? (
            <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-zinc-100 prose-pre:dark:bg-zinc-800 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-sm text-zinc-400 italic">
              {streaming ? "Thinking…" : ""}
            </span>
          )}
          {streaming && msg.content && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          )}

          {/* Sources inline at bottom of bubble */}
          {!isUser && msg.sources && msg.sources.length > 0 && (
            <SourceList sources={msg.sources} />
          )}
        </div>
      </div>
    </div>
  );
}
