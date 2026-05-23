import type { TavilyResult } from "../types/index.js";

const RSS_TIMEOUT_MS = 10_000;

function extractCdata(s: string): string {
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : s.trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function extractLink(itemXml: string): string {
  // <link> in RSS 2 is a plain text node between tags
  const direct = itemXml.match(/<link>(https?[^<]+)<\/link>/);
  if (direct) return direct[1].trim();
  // Some feeds use <link href="..."/>
  const attr = itemXml.match(/<link[^>]+href="([^"]+)"/);
  if (attr) return attr[1].trim();
  // Extract from description's first <a href>
  const descM = itemXml.match(/<description>([\s\S]*?)<\/description>/);
  if (descM) {
    const hrefM = descM[1].match(/href="(https?[^"]+)"/);
    if (hrefM) return hrefM[1];
  }
  return "";
}

export async function fetchRssNews(query: string, maxItems = 8): Promise<TavilyResult[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en&num=${maxItems}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RSS_TIMEOUT_MS);

  let xml: string;
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; India2WorldBot/1.0)" },
    });
    if (!resp.ok) throw new Error(`RSS HTTP ${resp.status}`);
    xml = await resp.text();
  } finally {
    clearTimeout(timer);
  }

  const results: TavilyResult[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null && results.length < maxItems) {
    const chunk = m[1];

    const titleM = chunk.match(/<title>([\s\S]*?)<\/title>/);
    const pubM = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descM = chunk.match(/<description>([\s\S]*?)<\/description>/);

    const title = titleM ? extractCdata(titleM[1]) : "";
    if (!title) continue;

    const link = extractLink(chunk);
    if (!link) continue;

    const snippet = descM ? stripHtml(extractCdata(descM[1])).slice(0, 280) : "";
    const pubDate = pubM ? pubM[1].trim() : undefined;

    results.push({
      title,
      url: link,
      content: snippet || undefined,
      published_date: pubDate ? (() => { try { return new Date(pubDate).toISOString(); } catch { return undefined; } })() : undefined,
      score: undefined,
    });
  }

  return results;
}
