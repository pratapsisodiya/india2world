import { NextRequest } from "next/server";
import { ChatRequestSchema } from "@/lib/server/types";
import { buildProfileContext } from "@/lib/server/utils/profileContext";
import { createSseStream } from "@/lib/server/utils/sse";
import { logger } from "@/lib/server/utils/logger";
import { streamOpenAI, streamGemini } from "@/lib/server/features/chat/chatService";

export const dynamic = "force-dynamic";

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

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, userProfile, provider } = parsed.data;
  const profileCtx = buildProfileContext(userProfile);
  const streamFn = provider === "gemini" ? streamGemini : streamOpenAI;
  
  const abortController = new AbortController();
  
  const stream = createSseStream(async (send) => {
    try {
      await streamFn(messages, profileCtx, send, abortController.signal);
      if (!abortController.signal.aborted) {
        send({ type: "done" });
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        logger.error("chat stream error", {
          provider,
          error: err instanceof Error ? err.message : String(err),
        });
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unexpected error while contacting the model.",
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
