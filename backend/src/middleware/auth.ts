import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/express";
import { ENV } from "../config/env.js";
import { logger } from "../utils/logger.js";

export interface AuthedRequest extends Request {
  userId: string;
  sessionId: string;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authorization header." });
      return;
    }
    if (!ENV.CLERK_SECRET_KEY) {
      res.status(503).json({ error: "Auth not configured on server." });
      return;
    }
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey: ENV.CLERK_SECRET_KEY });
    (req as AuthedRequest).userId = payload.sub;
    (req as AuthedRequest).sessionId = payload.sid ?? "";
    next();
  } catch (err) {
    logger.warn("auth failed", { error: err instanceof Error ? err.message : String(err) });
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
