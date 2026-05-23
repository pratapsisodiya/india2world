import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "backend/.env"),
  resolve(moduleDir, "../../.env"),
  resolve(moduleDir, "../../../.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    break;
  }
}

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
  OPENAI_API_KEY: (() => { const v = optional("OPENAI_API_KEY"); return v && !v.includes("dummy") && !v.includes("REPLACE") ? v : undefined; })(),
  GEMINI_API_KEY: (() => { const v = optional("GEMINI_API_KEY"); return v?.startsWith("AIzaSy") && !v.includes("REPLACE") && !v.includes("dummy") ? v : undefined; })(),
  TAVILY_API_KEY: (() => { const v = optional("TAVILY_API_KEY"); return v?.startsWith("tvly-") && !v.includes("REPLACE") && !v.includes("dummy") ? v : undefined; })(),
  DATABASE_URL: (() => { const v = optional("DATABASE_URL"); return v?.startsWith("postgres") && !v.includes("dummy") ? v : undefined; })(),
  CLERK_SECRET_KEY: (() => { const v = optional("CLERK_SECRET_KEY"); return v?.startsWith("sk_") && !v.includes("dummy") && !v.includes("REPLACE") ? v : undefined; })(),
  CLERK_PUBLISHABLE_KEY: (() => { const v = optional("CLERK_PUBLISHABLE_KEY"); return v?.startsWith("pk_") && !v.includes("dummy") && !v.includes("REPLACE") ? v : undefined; })(),
  CHAT_RATE_LIMIT: optionalInt("CHAT_RATE_LIMIT", 30),
  AGENT_RATE_LIMIT: optionalInt("AGENT_RATE_LIMIT", 10),
  SCHEME_RATE_LIMIT: optionalInt("SCHEME_RATE_LIMIT", 20),
  HS_RATE_LIMIT: optionalInt("HS_RATE_LIMIT", 20),
  REQUEST_TIMEOUT_MS: optionalInt("REQUEST_TIMEOUT_MS", 90_000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
