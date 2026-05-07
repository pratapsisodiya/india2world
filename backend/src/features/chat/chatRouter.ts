import express, { Request, Response } from "express";
import { ChatRequestSchema, type Message } from "../../types/index.js";
import { buildProfileContext } from "../../utils/profileContext.js";
import { openSse, sendSse } from "../../utils/sse.js";
import { logger } from "../../utils/logger.js";
import { streamOpenAI, streamGemini } from "./chatService.js";

const router = express.Router();

type StreamFn = (m: Message[], ctx: string, res: Response, sig: AbortSignal) => Promise<void>;

const PROVIDERS: Record<string, StreamFn> = {
  openai: streamOpenAI,
  gemini: streamGemini,
};

router.post("/api/chat", async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { messages, userProfile, provider } = parsed.data;
  const profileCtx = buildProfileContext(userProfile);
  const streamFn = PROVIDERS[provider] ?? streamOpenAI;
  const reqId = req.headers["x-request-id"] as string;

  const stopHeartbeat = openSse(res);
  const abort = new AbortController();

  req.on("close", () => {
    abort.abort();
    stopHeartbeat();
  });

  try {
    await streamFn(messages, profileCtx, res, abort.signal);
    if (!abort.signal.aborted) sendSse(res, { type: "done" });
  } catch (err) {
    if (!abort.signal.aborted) {
      logger.error("chat stream error", {
        reqId,
        provider,
        error: err instanceof Error ? err.message : String(err),
      });
      sendSse(res, {
        type: "error",
        message: err instanceof Error ? err.message : "Unexpected error while contacting the model.",
      });
    }
  } finally {
    stopHeartbeat();
    res.end();
  }
});

export default router;
