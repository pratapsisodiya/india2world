import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/server/features/agent/agentService";
import { fetchRssNews } from "@/lib/server/utils/rssFetcher";
import { NEWS_SECTION_QUERIES, NEWS_TTL_MS } from "@/lib/server/config/constants";
import { TtlCache } from "@/lib/server/utils/ttlCache";
import { ENV } from "@/lib/server/config/env";
import { logger } from "@/lib/server/utils/logger";
import type { NewsItem, NewsPayload } from "@/lib/server/types";

export const dynamic = "force-dynamic";

const newsCache = new TtlCache<NewsPayload>(NEWS_TTL_MS);

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") ?? "general";
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";

  if (!NEWS_SECTION_QUERIES[section]) {
    return NextResponse.json(
      { error: `Invalid section. Must be one of: ${Object.keys(NEWS_SECTION_QUERIES).join(", ")}` },
      { status: 400 }
    );
  }

  if (!refresh) {
    const cached = newsCache.get(section);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  try {
    const query = NEWS_SECTION_QUERIES[section]!;
    const results = ENV.TAVILY_API_KEY
      ? await searchNews(query)
      : await fetchRssNews(query);

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
    return NextResponse.json(payload);
  } catch (err) {
    logger.error("news fetch error", { section, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch news." }, { status: 502 });
  }
}
