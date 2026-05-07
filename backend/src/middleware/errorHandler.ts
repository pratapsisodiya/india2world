import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Not found", path: req.path });
}

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const reqId = req.headers["x-request-id"] as string;
  logger.error("unhandled error", {
    reqId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
}
