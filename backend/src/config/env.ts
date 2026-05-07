import "dotenv/config";

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined;
}

function optionalInt(key: string, fallback: number): number {
  const v = process.env[key];
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const ENV = {
  PORT: optionalInt("PORT", 4000),
  FRONTEND_ORIGINS: (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  OPENAI_API_KEY: optional("OPENAI_API_KEY"),
  GEMINI_API_KEY: optional("GEMINI_API_KEY"),
  TAVILY_API_KEY: optional("TAVILY_API_KEY"),
  DATABASE_URL: optional("DATABASE_URL"),
  CLERK_SECRET_KEY: optional("CLERK_SECRET_KEY"),
  CLERK_PUBLISHABLE_KEY: optional("CLERK_PUBLISHABLE_KEY"),
  CHAT_RATE_LIMIT: optionalInt("CHAT_RATE_LIMIT", 30),
  AGENT_RATE_LIMIT: optionalInt("AGENT_RATE_LIMIT", 10),
  SCHEME_RATE_LIMIT: optionalInt("SCHEME_RATE_LIMIT", 20),
  HS_RATE_LIMIT: optionalInt("HS_RATE_LIMIT", 20),
  REQUEST_TIMEOUT_MS: optionalInt("REQUEST_TIMEOUT_MS", 90_000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
