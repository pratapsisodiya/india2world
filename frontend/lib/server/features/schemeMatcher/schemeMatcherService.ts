import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai";
import { getGeminiClient, GEMINI_MODEL } from "../../providers/gemini";
import { SCHEME_MATCHER_PROMPT } from "../../config/systemPrompts";
import { TtlCache } from "../../utils/ttlCache";
import { logger } from "../../utils/logger";
import { ENV } from "../../config/env";
import type { SchemeMatcherRequest, SchemeMatcherResponse } from "../../types";

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

  if (!ENV.OPENAI_API_KEY && !ENV.GEMINI_API_KEY) {
    throw new Error("No AI provider configured.");
  }

  let rawText: string;

  if (ENV.OPENAI_API_KEY) {
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
    rawText = completion.choices[0]?.message?.content ?? "";
  } else {
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SCHEME_MATCHER_PROMPT,
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 } as any,
    });
    const result = await model.generateContent(buildUserMessage(request));
    rawText = result.response.text();
  }

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
