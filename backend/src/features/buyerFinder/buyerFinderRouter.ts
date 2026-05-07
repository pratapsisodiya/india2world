import express, { Request, Response } from "express";
import { BuyerFinderRequestSchema } from "../../types/index.js";
import { findBuyers } from "./buyerFinderService.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

router.post("/api/buyers/find", async (req: Request, res: Response) => {
  const parsed = BuyerFinderRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const reqId = req.headers["x-request-id"] as string;
  const abort = new AbortController();
  req.on("close", () => abort.abort());

  try {
    const result = await findBuyers(parsed.data, abort.signal);
    res.json(result);
  } catch (err) {
    if (abort.signal.aborted) return;
    logger.error("buyer finder error", {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to find buyers.",
    });
  }
});

export default router;
