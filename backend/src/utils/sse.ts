import type { Response } from "express";
import type { SseEvent } from "../types/index.js";
import { SSE_HEARTBEAT_INTERVAL_MS } from "../config/constants.js";

export function sendSse(res: Response, event: SseEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/** Opens SSE headers and returns a cleanup function. */
export function openSse(res: Response): () => void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Heartbeat — keeps the connection alive through proxies and load balancers
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      sendSse(res, { type: "heartbeat" });
    }
  }, SSE_HEARTBEAT_INTERVAL_MS);

  return () => clearInterval(heartbeat);
}
