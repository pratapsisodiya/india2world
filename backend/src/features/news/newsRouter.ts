import express, { Request, Response } from "express";
import { searchNews } from "../agent/agentService.js";
import { NEWS_SECTION_QUERIES, NEWS_TTL_MS } from "../../config/constants.js";
import { TtlCache } from "../../utils/ttlCache.js";
import { ENV } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import type { NewsItem, NewsPayload } from "../../types/index.js";

const router = express.Router();
const newsCache = new TtlCache<NewsPayload>(NEWS_TTL_MS);

router.get("/api/news/exports", async (req: Request, res: Response) => {
  const section = String(req.query["section"] ?? "general");
  const refresh = req.query["refresh"] === "1";

  if (!NEWS_SECTION_QUERIES[section]) {
    res.status(400).json({
      error: `Invalid section. Must be one of: ${Object.keys(NEWS_SECTION_QUERIES).join(", ")}`,
    });
    return;
  }

  if (!ENV.TAVILY_API_KEY) {
    res.status(503).json({
      error: "Web search is not configured.",
      hint: "Add TAVILY_API_KEY to backend/.env (free tier at tavily.com gives 1,000 searches/month).",
    });
    return;
  }

  if (!refresh) {
    const cached = newsCache.get(section);
    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }
  }

  try {
    const results = await searchNews(NEWS_SECTION_QUERIES[section]!);

    const items: NewsItem[] = results.map((r) => {
      let domain = "";
      try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
      return {
        title: r.title ?? r.url,
        url: r.url,
        snippet: (r.content ?? "").slice(0, 280),
        source: domain,
        publishedDate: r.published_date ?? null,
        score: r.score ?? null,
      };
    });

    const payload: NewsPayload = { section, items, fetchedAt: Date.now(), cached: false };
    newsCache.set(section, payload);
    res.json(payload);
  } catch (err) {
    logger.error("news fetch error", { section, error: err instanceof Error ? err.message : String(err) });
    res.status(502).json({ error: err instanceof Error ? err.message : "Failed to fetch news." });
  }
});

export default router;
