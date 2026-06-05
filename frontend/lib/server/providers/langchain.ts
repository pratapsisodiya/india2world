import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ENV } from "../config/env";

export type LcProvider = "openai" | "gemini";

export function buildLangChainLLM(provider: LcProvider = ENV.OPENAI_API_KEY ? "openai" : "gemini") {
  if (provider === "gemini") {
    if (!ENV.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
    return new ChatGoogleGenerativeAI({
      apiKey: ENV.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      maxOutputTokens: 4096,
      streaming: true,
    });
  }

  if (ENV.OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: ENV.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      maxTokens: 4096,
      streaming: true,
    });
  }

  if (ENV.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: ENV.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      maxOutputTokens: 4096,
      streaming: true,
    });
  }

  throw new Error("No AI provider is configured. Add OPENAI_API_KEY or GEMINI_API_KEY.");
}
