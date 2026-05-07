import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai.js";
import { HS_CLASSIFIER_PROMPT } from "../../config/systemPrompts.js";
import { TtlCache } from "../../utils/ttlCache.js";
import { logger } from "../../utils/logger.js";
import type { HsClassifierRequest, HsClassifierResponse } from "../../types/index.js";

const hsCache = new TtlCache<HsClassifierResponse>(24 * 60 * 60 * 1000);

function buildCacheKey(req: HsClassifierRequest): string {
  return JSON.stringify({
    desc: req.productDescription.toLowerCase().trim(),
    sector: req.sector?.toLowerCase().trim(),
  });
}

function buildUserMessage(req: HsClassifierRequest): string {
  const lines = [
    `Product description: ${req.productDescription}`,
    req.sector ? `Sector: ${req.sector}` : null,
    req.additionalContext ? `Additional context: ${req.additionalContext}` : null,
  ].filter(Boolean);

  return (
    "Classify the following product under the Indian ITC-HS tariff schedule:\n\n" +
    lines.join("\n")
  );
}

export async function classifyHsCode(
  request: HsClassifierRequest,
  signal?: AbortSignal,
): Promise<HsClassifierResponse> {
  const cacheKey = buildCacheKey(request);
  const cached = hsCache.get(cacheKey);
  if (cached) return cached;

  const client = getOpenAIClient();

  const completion = await client.chat.completions.create(
    {
      model: OPENAI_MODEL_LARGE,
      max_tokens: 2048,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: HS_CLASSIFIER_PROMPT },
        { role: "user", content: buildUserMessage(request) },
      ],
    },
    { signal },
  );

  const rawText = completion.choices[0]?.message?.content ?? "";

  let result: HsClassifierResponse;
  try {
    result = JSON.parse(rawText) as HsClassifierResponse;
  } catch {
    logger.error("hs classifier JSON parse failed", { rawText: rawText.slice(0, 200) });
    throw new Error("AI returned an unexpected response format. Please try again.");
  }

  if (!Array.isArray(result.topMatches) || result.topMatches.length === 0) {
    throw new Error("AI response missing 'topMatches' array.");
  }

  hsCache.set(cacheKey, result);
  return result;
}
