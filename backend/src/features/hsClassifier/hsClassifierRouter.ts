import express, { Request, Response } from "express";
import { HsClassifierRequestSchema } from "../../types/index.js";
import { classifyHsCode } from "./hsClassifierService.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

/**
 * POST /api/hs/classify
 *
 * AI-powered HS code classifier. Given a product description, returns the
 * top 1–3 ITC-HS chapter/heading matches with confidence scores, regulatory
 * flags, and next steps for verification.
 *
 * Request body: HsClassifierRequest (validated by Zod)
 * Response: HsClassifierResponse JSON
 */
router.post("/api/hs/classify", async (req: Request, res: Response) => {
  const parsed = HsClassifierRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const reqId = req.headers["x-request-id"] as string;
  const abort = new AbortController();
  req.on("close", () => abort.abort());

  try {
    const result = await classifyHsCode(parsed.data, abort.signal);
    res.json(result);
  } catch (err) {
    if (abort.signal.aborted) return;
    logger.error("hs classifier error", {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to classify HS code.",
    });
  }
});

export default router;
