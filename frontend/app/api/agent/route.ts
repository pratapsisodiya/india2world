import { NextRequest } from "next/server";
import { AgentRequestSchema, type SourceEntry } from "@/lib/server/types";
import { createSseStream } from "@/lib/server/utils/sse";
import { logger } from "@/lib/server/utils/logger";
import { streamAgentEvents } from "@/lib/server/features/agent/agentService";

export const dynamic = "force-dynamic";

function collectSources(toolOutput: unknown, map: Map<string, SourceEntry>): void {
  try {
    const parsed: { results?: Array<{ url?: string; title?: string; content?: string }> } =
      typeof toolOutput === "string" ? JSON.parse(toolOutput) : toolOutput as any;

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

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = AgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, provider, userProfile } = parsed.data;
  const abortController = new AbortController();
  const sourcesByUrl = new Map<string, SourceEntry>();

  const stream = createSseStream(async (send) => {
    try {
      const eventStream = streamAgentEvents(messages, {
        abortSignal: abortController.signal,
        provider,
        userProfile,
      });

      for await (const event of eventStream) {
        if (abortController.signal.aborted) break;

        if ("event" in event && event.event === "config_error") {
          const e = event as { event: string; message: string };
          send({ type: "error", message: e.message });
          continue;
        }

        const { event: kind, name, data } = event as {
          event: string;
          name?: string;
          data?: Record<string, unknown>;
        };

        if (kind === "on_tool_start") {
          const input = (data?.input as Record<string, string>)?.query ?? data?.input ?? "";
          send({
            type: "tool_start",
            tool: name ?? "tool",
            input: typeof input === "string" ? input : JSON.stringify(input),
          });
          continue;
        }

        if (kind === "on_tool_end") {
          const output = data?.output;
          collectSources(output, sourcesByUrl);
          let resultCount = 0;
          try {
            const p = typeof output === "string"
              ? JSON.parse(output) as { results?: unknown[] }
              : output as { results?: unknown[] };
            resultCount = p?.results?.length ?? 0;
          } catch { /* ignore */ }
          send({ type: "tool_end", tool: name ?? "tool", resultCount });
          continue;
        }

        if (kind === "on_chat_model_stream") {
          const chunk = data?.chunk as { content?: string | Array<{ type?: string; text?: string }> };
          const content = chunk?.content;
          if (typeof content === "string" && content) {
            send({ type: "text", text: content });
          } else if (Array.isArray(content)) {
            for (const c of content) {
              if (c?.type === "text" && typeof c.text === "string" && c.text) {
                send({ type: "text", text: c.text });
              }
            }
          }
          continue;
        }
      }

      if (!abortController.signal.aborted) {
        if (sourcesByUrl.size > 0) {
          send({ type: "sources", sources: Array.from(sourcesByUrl.values()) });
        }
        send({ type: "done" });
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        logger.error("agent error", {
          provider,
          error: err instanceof Error ? err.message : String(err),
        });
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unexpected error while running the agent.",
        });
      }
    }
  }, () => {
    abortController.abort();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
