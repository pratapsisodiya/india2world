import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai.js";
import { SCHEME_MATCHER_PROMPT } from "../../config/systemPrompts.js";
import { TtlCache } from "../../utils/ttlCache.js";
import { logger } from "../../utils/logger.js";
import type { SchemeMatcherRequest, SchemeMatcherResponse } from "../../types/index.js";

const matchCache = new TtlCache<SchemeMatcherResponse>(60 * 60 * 1000);

function buildCacheKey(req: SchemeMatcherRequest): string {
  return JSON.stringify({
    sector: req.sector.toLowerCase().trim(),
    products: req.exportProducts.toLowerCase().trim(),
    stage: req.exportStage,
    type: req.businessType,
    hasIEC: req.hasIEC,
    hasGST: req.hasGST,
  });
}

function buildUserMessage(req: SchemeMatcherRequest): string {
  const lines = [
    `Sector: ${req.sector}`,
    `Export products: ${req.exportProducts}`,
    `Business type: ${req.businessType}`,
    req.exportStage ? `Export stage: ${req.exportStage}` : null,
    req.annualTurnover ? `Annual turnover: ${req.annualTurnover}` : null,
    req.hasIEC !== undefined ? `Has IEC: ${req.hasIEC ? "Yes" : "No"}` : null,
    req.hasGST !== undefined ? `Has GST registration: ${req.hasGST ? "Yes" : "No"}` : null,
    req.targetMarkets?.length ? `Target markets: ${req.targetMarkets.join(", ")}` : null,
    req.location ? `Location: ${req.location}` : null,
  ].filter(Boolean);

  return (
    "Analyse this exporter's profile and recommend the most relevant Indian export schemes:\n\n" +
    lines.join("\n")
  );
}

export async function matchSchemes(
  request: SchemeMatcherRequest,
  signal?: AbortSignal,
): Promise<SchemeMatcherResponse> {
  const cacheKey = buildCacheKey(request);
  const cached = matchCache.get(cacheKey);
  if (cached) return cached;

  const client = getOpenAIClient();

  const completion = await client.chat.completions.create(
    {
      model: OPENAI_MODEL_LARGE,
      max_tokens: 4096,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SCHEME_MATCHER_PROMPT },
        { role: "user", content: buildUserMessage(request) },
      ],
    },
    { signal },
  );

  const rawText = completion.choices[0]?.message?.content ?? "";

  let result: SchemeMatcherResponse;
  try {
    result = JSON.parse(rawText) as SchemeMatcherResponse;
  } catch {
    logger.error("scheme matcher JSON parse failed", { rawText: rawText.slice(0, 200) });
    throw new Error("AI returned an unexpected response format. Please try again.");
  }

  if (!Array.isArray(result.recommended)) {
    throw new Error("AI response missing 'recommended' array.");
  }

  matchCache.set(cacheKey, result);
  return result;
}
