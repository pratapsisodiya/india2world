import express, { Request, Response } from "express";
import { ComplianceScreeningRequestSchema } from "../../types/index.js";
import { screenEntity } from "./complianceService.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

router.post("/api/compliance/screen", async (req: Request, res: Response) => {
  const parsed = ComplianceScreeningRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const reqId = req.headers["x-request-id"] as string;
  const abort = new AbortController();
  req.on("close", () => abort.abort());

  try {
    const result = await screenEntity(parsed.data, abort.signal);
    res.json(result);
  } catch (err) {
    if (abort.signal.aborted) return;
    logger.error("compliance screening error", {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to screen entity.",
    });
  }
});

export default router;
