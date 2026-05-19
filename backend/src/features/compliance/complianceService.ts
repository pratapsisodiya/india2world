import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai.js";
import { logger } from "../../utils/logger.js";
import type { ComplianceScreeningRequest, ComplianceScreeningResponse } from "../../types/index.js";

const SYSTEM_PROMPT = `You are a strict, expert Global Trade Compliance Officer.
Your job is to screen entities (companies, individuals) and countries against global watchlists (OFAC SDN, BIS Entity List, UN Sanctions, EU Sanctions) to assess export risk.

Given an entity name, country, and entity type, perform a simulated compliance check.
Use your knowledge cutoff to identify if the entity or country is heavily sanctioned or embargoed.

Return ONLY this JSON structure (no markdown fences):
{
  "status": "clear" | "warning" | "blocked",
  "riskScore": 0-100, (0 is safe, 100 is absolutely blocked/sanctioned)
  "matchedLists": ["list of watchlists matched or potential matches, empty array if none"],
  "reasoning": "Detailed explanation of why this risk score and status were given. Mention any fuzzy matches or country-level embargoes.",
  "countryStatus": "Brief assessment of the country's risk profile (e.g., 'Comprehensive Embargo', 'Targeted Sanctions', or 'Clear').",
  "recommendation": "Actionable advice for the exporter (e.g., 'Proceed with transaction', 'Escalate to legal team', 'Block transaction immediately')."
}

Rules:
- Countries like Iran, North Korea, Syria, Russia, Cuba, Belarus should return high risk scores (80-100) and status "blocked" or "warning".
- If the entity is a well-known sanctioned entity (e.g., Aeroflot, Huawei, Huawei affiliates, Russian state banks), return "blocked".
- If it's a completely normal/safe entity (e.g., "Microsoft", "USA"), return "clear" and a low risk score (0-10).
- If it's a generic name in a medium-risk country, return "warning" (risk score 30-60) and suggest enhanced due diligence.
- Return ONLY valid JSON.`;

export async function screenEntity(
  request: ComplianceScreeningRequest,
  signal?: AbortSignal,
): Promise<ComplianceScreeningResponse> {
  const client = getOpenAIClient();
  const userMsg = `Entity Name: ${request.entityName}\nCountry: ${request.country}\nEntity Type: ${request.entityType}`;

  const completion = await client.chat.completions.create(
    {
      model: OPENAI_MODEL_LARGE,
      max_tokens: 1500,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
    },
    { signal },
  );

  const rawText = completion.choices[0]?.message?.content ?? "";
  let result: ComplianceScreeningResponse;
  try {
    result = JSON.parse(rawText) as ComplianceScreeningResponse;
  } catch {
    logger.error("compliance screening JSON parse failed", { rawText: rawText.slice(0, 200) });
    throw new Error("AI returned unexpected format. Please try again.");
  }

  // Validate the output roughly
  if (!result.status || typeof result.riskScore !== "number") {
    throw new Error("Invalid response format from compliance AI.");
  }

  return result;
}
