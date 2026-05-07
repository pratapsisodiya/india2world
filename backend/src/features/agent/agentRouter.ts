import express, { Request, Response } from "express";
import { AgentRequestSchema, type SourceEntry } from "../../types/index.js";
import { openSse, sendSse } from "../../utils/sse.js";
import { logger } from "../../utils/logger.js";
import { streamAgentEvents } from "./agentService.js";

const router = express.Router();

function collectSources(toolOutput: unknown, map: Map<string, SourceEntry>): void {
  try {
    // toolOutput may already be an object — only parse if it's a string
    const parsed: { results?: Array<{ url?: string; title?: string; content?: string }> } =
      typeof toolOutput === "string" ? JSON.parse(toolOutput) : toolOutput as typeof parsed;

    const results = parsed?.results ?? [];
    if (!Array.isArray(results)) return;

    for (const r of results) {
      if (!r?.url || map.has(r.url)) continue;
      let domain = "";
      try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
      map.set(r.url, {
        title: r.title ?? r.url,
        url: r.url,
        domain,
        snippet: (r.content ?? "").slice(0, 240),
      });
    }
  } catch { /* best-effort */ }
}

router.post("/api/agent", async (req: Request, res: Response) => {
  const parsed = AgentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { messages, provider, userProfile } = parsed.data;
  const reqId = req.headers["x-request-id"] as string;

  const stopHeartbeat = openSse(res);
  const abort = new AbortController();
  req.on("close", () => {
    abort.abort();
    stopHeartbeat();
  });

  const sourcesByUrl = new Map<string, SourceEntry>();

  try {
    const stream = streamAgentEvents(messages, {
      abortSignal: abort.signal,
      provider,
      userProfile,
    });

    for await (const event of stream) {
      if (abort.signal.aborted) break;

      if ("event" in event && event.event === "config_error") {
        const e = event as { event: string; message: string };
        sendSse(res, { type: "error", message: e.message });
        continue;
      }

      const { event: kind, name, data } = event as {
        event: string;
        name?: string;
        data?: Record<string, unknown>;
      };

      if (kind === "on_tool_start") {
        const input = (data?.input as Record<string, string>)?.query ?? data?.input ?? "";
        sendSse(res, {
          type: "tool_start",
          tool: name ?? "tool",
          input: typeof input === "string" ? input : JSON.stringify(input),
        });
        continue;
      }

      if (kind === "on_tool_end") {
        // Fix: pass the raw output object — don't double-stringify before collectSources
        const output = data?.output;
        collectSources(output, sourcesByUrl);
        let resultCount = 0;
        try {
          const p = typeof output === "string"
            ? JSON.parse(output) as { results?: unknown[] }
            : output as { results?: unknown[] };
          resultCount = p?.results?.length ?? 0;
        } catch { /* ignore */ }
        sendSse(res, { type: "tool_end", tool: name ?? "tool", resultCount });
        continue;
      }

      if (kind === "on_chat_model_stream") {
        const chunk = data?.chunk as { content?: string | Array<{ type?: string; text?: string }> };
        const content = chunk?.content;
        if (typeof content === "string" && content) {
          sendSse(res, { type: "text", text: content });
        } else if (Array.isArray(content)) {
          for (const c of content) {
            if (c?.type === "text" && typeof c.text === "string" && c.text) {
              sendSse(res, { type: "text", text: c.text });
            }
          }
        }
        continue;
      }
    }

    if (!abort.signal.aborted) {
      if (sourcesByUrl.size > 0) {
        sendSse(res, { type: "sources", sources: Array.from(sourcesByUrl.values()) });
      }
      sendSse(res, { type: "done" });
    }
  } catch (err) {
    if (!abort.signal.aborted) {
      logger.error("agent error", {
        reqId,
        provider,
        error: err instanceof Error ? err.message : String(err),
      });
      sendSse(res, {
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error while running the agent.",
      });
    }
  } finally {
    stopHeartbeat();
    res.end();
  }
});

export default router;
