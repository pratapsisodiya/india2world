"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatToolCall, ChatSource } from "@/store/chat";

export interface AIStreamEvent {
  type: "text" | "tool_start" | "tool_end" | "sources" | "done" | "error";
  text?: string;
  tool?: string;
  input?: string;
  resultCount?: number;
  sources?: ChatSource[];
  message?: string;
}

type StreamCallbacks = {
  onSuccess?: (content: string, tools: ChatToolCall[], srcs: ChatSource[]) => void;
  onError?: (err: Error, partialContent: string) => void;
  onEvent?: (event: AIStreamEvent) => void;
};

function classifyError(status: number): string {
  if (status === 401 || status === 403) return "Authentication error. Check your API keys in settings.";
  if (status === 429) return "Rate limit reached. Please wait a moment and try again.";
  if (status === 500) return "The AI service is temporarily unavailable. Please try again.";
  if (status === 503) return "Service unavailable. The backend may be starting up — retry in a few seconds.";
  return `Backend error (${status}). Please try again.`;
}

export function useSSE() {
  const [streaming, setStreaming] = useState(false);
  const [buffer, setBuffer] = useState("");
  const [toolCalls, setToolCalls] = useState<ChatToolCall[]>([]);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    streamingRef.current = false;
  }, []);

  const startStream = useCallback(
    async (
      url: string,
      body: Record<string, unknown>,
      callbacks?: StreamCallbacks
    ) => {
      // Prevent concurrent streams
      if (streamingRef.current) return;

      setError(null);
      setStreaming(true);
      setBuffer("");
      setToolCalls([]);
      setSources([]);
      streamingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      let currentBuffer = "";
      let currentTools: ChatToolCall[] = [];
      let currentSources: ChatSource[] = [];

      try {
        let resp: Response;
        try {
          resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        } catch (fetchErr) {
          if ((fetchErr as Error).name === "AbortError") return;
          throw new Error("Could not connect to the AI service. Make sure the backend is running.");
        }

        if (!resp.ok) {
          throw new Error(classifyError(resp.status));
        }

        if (!resp.body) {
          throw new Error("No response body received from server.");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let rawBuf = "";
        let done = false;

        while (!done) {
          let chunk: { value: Uint8Array | undefined; done: boolean };
          try {
            chunk = await reader.read();
          } catch (readErr) {
            if ((readErr as Error).name === "AbortError") return;
            throw new Error("Stream interrupted. Partial response was saved.");
          }

          if (chunk.done) break;
          rawBuf += decoder.decode(chunk.value, { stream: true });

          // Process all complete SSE frames (separated by double newline)
          let idx: number;
          while ((idx = rawBuf.indexOf("\n\n")) !== -1) {
            const rawLine = rawBuf.slice(0, idx);
            rawBuf = rawBuf.slice(idx + 2);
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;

            let event: AIStreamEvent;
            try {
              event = JSON.parse(payload) as AIStreamEvent;
            } catch {
              // Non-JSON data line — skip gracefully
              continue;
            }

            callbacks?.onEvent?.(event);

            if (event.type === "text" && event.text) {
              currentBuffer += event.text;
              setBuffer(currentBuffer);
            } else if (event.type === "tool_start" && event.tool) {
              currentTools = [
                ...currentTools,
                {
                  id: crypto.randomUUID(),
                  tool: event.tool,
                  input: event.input || "",
                  status: "running",
                },
              ];
              setToolCalls(currentTools);
            } else if (event.type === "tool_end") {
              currentTools = currentTools.map((c, i, arr) =>
                i === arr.length - 1 && c.status === "running"
                  ? { ...c, status: "done", resultCount: event.resultCount }
                  : c
              );
              setToolCalls(currentTools);
            } else if (event.type === "sources" && event.sources) {
              currentSources = event.sources;
              setSources(currentSources);
            } else if (event.type === "done") {
              done = true;
              break;
            } else if (event.type === "error" && event.message) {
              throw new Error(event.message);
            }
          }
        }

        callbacks?.onSuccess?.(currentBuffer, currentTools, currentSources);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const e = err instanceof Error ? err : new Error("Stream failed unexpectedly.");
        setError(e.message);
        callbacks?.onError?.(e, currentBuffer);
      } finally {
        setStreaming(false);
        streamingRef.current = false;
        abortRef.current = null;
      }
    },
    []
  );

  return {
    startStream,
    stop,
    streaming,
    buffer,
    toolCalls,
    sources,
    error,
    setError,
    setBuffer,
    setToolCalls,
    setSources,
  };
}
