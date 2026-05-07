export const INDIAN_TRADE_DOMAINS = [
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

export const NEWS_SECTION_QUERIES: Record<string, string> = {
  general: "India exports news latest announcements DGFT trade policy",
  schemes: "India export incentive schemes RoDTEP EPCG Advance Authorisation news update",
  fta: "India free trade agreement FTA tariff news CEPA ECTA",
  dgft: "DGFT notification public notice trade notice India exports",
  customs: "India customs duty CBIC ICEGATE notification exports",
};

export const NEWS_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const SSE_HEARTBEAT_INTERVAL_MS = 20_000; // 20 seconds — prevents proxies from closing idle SSE connections
