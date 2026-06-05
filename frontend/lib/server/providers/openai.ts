import OpenAI from "openai";
import { ENV } from "../config/env";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    if (ENV.OPENAI_API_KEY) {
      _client = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    } else {
      throw new Error("OPENAI_API_KEY is not configured.");
    }
  }
  return _client;
}

export const OPENAI_MODEL = "gpt-4o-mini";
export const OPENAI_MODEL_LARGE = "gpt-4o-mini";
