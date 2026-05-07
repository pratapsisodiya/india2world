import express, { Request, Response } from "express";
import { SchemeMatcherRequestSchema } from "../../types/index.js";
import { matchSchemes } from "./schemeMatcherService.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

/**
 * POST /api/schemes/match
 *
 * AI-powered scheme matcher. Given an exporter's profile, returns a ranked
 * list of government export schemes they qualify for with reasoning and
 * immediate action steps.
 *
 * Request body: SchemeMatcherRequest (validated by Zod)
 * Response: SchemeMatcherResponse JSON
 */
router.post("/api/schemes/match", async (req: Request, res: Response) => {
  const parsed = SchemeMatcherRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const reqId = req.headers["x-request-id"] as string;
  const abort = new AbortController();
  req.on("close", () => abort.abort());

  try {
    const result = await matchSchemes(parsed.data, abort.signal);
    res.json(result);
  } catch (err) {
    if (abort.signal.aborted) return;
    logger.error("scheme matcher error", {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to match schemes.",
    });
  }
});

export default router;
