import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai";
import { TavilySearch } from "@langchain/tavily";
import { TtlCache } from "../../utils/ttlCache";
import { logger } from "../../utils/logger";
import { ENV } from "../../config/env";
import type { BuyerFinderRequest, BuyerFinderResponse } from "../../types";

const cache = new TtlCache<BuyerFinderResponse>(30 * 60 * 1000); // 30 min

const SYSTEM_PROMPT = `You are an expert at finding genuine importers and buyers for Indian export products.
Given a product, target country, and web search results, extract real potential buyers.

Return ONLY this JSON (no markdown fences):
{
  "buyers": [
    {
      "companyName": "Acme Imports Ltd",
      "country": "UAE",
      "type": "Importer / Distributor / Retailer / B2B Marketplace",
      "website": "https://acme.com",
      "email": "import@acme.com (if found)",
      "phone": "+971-xxx (if found)",
      "productCategories": ["spices", "food ingredients"],
      "annualImportVolume": "~$2M (if mentioned)",
      "notes": "Specialises in South Asian food products, established 2005",
      "sourceUrl": "https://page-where-found.com"
    }
  ],
  "searchSummary": "2-3 sentences on the import market landscape for this product in this country",
  "outreachTips": [
    "Tip 1: specific outreach advice for this product-country combination",
    "Tip 2: ...",
    "Tip 3: ..."
  ],
  "verificationNote": "Always verify buyer credentials via Dun & Bradstreet, Ministry of Commerce, or official trade directories before sending samples or payment."
}

Rules:
- Include 3–8 buyers. Only include companies that appear to be genuine importers/distributors.
- If you cannot find specific buyers, include trade associations, industry directories, or B2B platforms active in that country.
- Never fabricate contact details — only include what's in the search results.
- Return only the JSON.`;

export async function findBuyers(
  request: BuyerFinderRequest,
  signal?: AbortSignal,
): Promise<BuyerFinderResponse> {
  const cacheKey = JSON.stringify({
    product: request.product.toLowerCase().trim(),
    country: request.targetCountry.toLowerCase().trim(),
    hs: request.hsCode,
  });

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Step 1: web search for real buyers
  let searchContext = "";
  if (ENV.TAVILY_API_KEY) {
    try {
      const searcher = new TavilySearch({
        tavilyApiKey: ENV.TAVILY_API_KEY,
        maxResults: 8,
        searchDepth: "advanced",
        includeAnswer: false,
        includeRawContent: false,
      });

      const queries = [
        `${request.product} importer distributor ${request.targetCountry} contact`,
        `buy ${request.product} wholesale ${request.targetCountry} supplier`,
        `${request.targetCountry} ${request.product} import company`,
      ];

      const results = await Promise.allSettled(
        queries.map((q) => searcher.invoke({ query: q }, { signal })),
      );

      const texts: string[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          const raw = typeof r.value === "string" ? r.value : JSON.stringify(r.value);
          texts.push(raw.slice(0, 2000));
        }
      }
      searchContext = texts.join("\n\n---\n\n");
    } catch (err) {
      logger.warn("buyer search web fetch failed", { error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Step 2: extract structured buyers from search results
  const client = getOpenAIClient();
  const userMsg = [
    `Product: ${request.product}`,
    request.hsCode ? `HS Code: ${request.hsCode}` : null,
    request.sector ? `Sector: ${request.sector}` : null,
    `Target country: ${request.targetCountry}`,
    searchContext ? `\n\nWeb search results:\n${searchContext}` : "\n\nNo web results available — use your knowledge to suggest likely buyers, directories, and trade associations.",
  ].filter(Boolean).join("\n");

  const completion = await client.chat.completions.create(
    {
      model: OPENAI_MODEL_LARGE,
      max_tokens: 3000,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
    },
    { signal },
  );

  const rawText = completion.choices[0]?.message?.content ?? "";
  let result: BuyerFinderResponse;
  try {
    result = JSON.parse(rawText) as BuyerFinderResponse;
  } catch {
    logger.error("buyer finder JSON parse failed", { rawText: rawText.slice(0, 200) });
    throw new Error("AI returned unexpected format. Please try again.");
  }

  if (!Array.isArray(result.buyers)) throw new Error("Invalid response: missing buyers array.");

  cache.set(cacheKey, result);
  return result;
}
