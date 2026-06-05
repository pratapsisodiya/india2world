import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

let _client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    if (!ENV.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
    _client = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  }
  return _client;
}

export const GEMINI_MODEL = "gemini-2.0-flash";
