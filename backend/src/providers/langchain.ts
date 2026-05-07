import { ChatOpenAI } from "@langchain/openai";
import { ENV } from "../config/env.js";

export type LcProvider = "openai";

export function buildLangChainLLM(_provider?: LcProvider) {
  if (!ENV.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  return new ChatOpenAI({
    apiKey: ENV.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    maxTokens: 4096,
    streaming: true,
  });
}
