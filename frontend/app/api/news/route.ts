import { NextRequest, NextResponse } from "next/server";

const SECTION_QUERIES: Record<string, string> = {
  general: "India exports news latest announcements DGFT trade policy",
  schemes: "India export incentive schemes RoDTEP EPCG Advance Authorisation news update",
  fta: "India free trade agreement FTA tariff news CEPA ECTA",
  dgft: "DGFT notification public notice trade notice India exports",
  customs: "India customs duty CBIC ICEGATE notification exports",
};

const TRADE_DOMAINS = [
  "dgft.gov.in",
  "apeda.gov.in",
  "icegate.gov.in",
  "cbic.gov.in",
  "commerce.gov.in",
  "taxguru.in",
  "businessstandard.com",
  "economictimes.indiatimes.com",
  "livemint.com",
  "thehindubusinessline.com",
];

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") ?? "general";

  const query = SECTION_QUERIES[section];
  if (!query) {
    return NextResponse.json(
      { error: `Invalid section. Must be one of: ${Object.keys(SECTION_QUERIES).join(", ")}` },
      { status: 400 },
    );
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey.includes("dummy") || apiKey.includes("REPLACE")) {
    return NextResponse.json(
      {
        error: "Tavily API key not configured.",
        hint: "Set TAVILY_API_KEY in frontend/.env.local (free key at tavily.com).",
      },
      { status: 503 },
    );
  }

  try {
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        topic: "news",
        time_range: "month",
        include_domains: TRADE_DOMAINS,
        max_results: 8,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { message?: string }).message ?? `Tavily error ${resp.status}` },
        { status: 502 },
      );
    }

    const data = await resp.json() as { results?: Array<{ title: string; url: string; content?: string; published_date?: string }> };

    const items = (data.results ?? []).map((r) => {
      let domain = "";
      try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
      return {
        title: r.title,
        url: r.url,
        snippet: (r.content ?? "").slice(0, 280),
        source: domain,
        publishedDate: r.published_date ?? null,
      };
    });

    return NextResponse.json({ section, items, fetchedAt: Date.now(), cached: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch news." },
      { status: 502 },
    );
  }
}
