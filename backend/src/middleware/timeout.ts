import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";

/**
 * Adds a server-side timeout to non-SSE requests.
 * SSE routes manage their own lifecycle via AbortController.
 */
export function requestTimeout(req: Request, res: Response, next: NextFunction): void {
  // SSE connections stay open; skip timeout
  if (req.headers.accept?.includes("text/event-stream")) {
    next();
    return;
  }

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: "Request timed out." });
    }
  }, ENV.REQUEST_TIMEOUT_MS);

  res.on("finish", () => clearTimeout(timer));
  res.on("close", () => clearTimeout(timer));
  next();
}
