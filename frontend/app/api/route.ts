import { NextResponse } from "next/server";
import { ENV } from "@/lib/server/config/env";
import { runMigrations } from "@/lib/server/config/db";
import { logger } from "@/lib/server/utils/logger";

export const dynamic = "force-dynamic";

// Run migrations on first health check if DB is configured
let migrationsStarted = false;

export async function GET() {
  if (ENV.DATABASE_URL && !migrationsStarted) {
    migrationsStarted = true;
    runMigrations()
      .then(() => logger.info("DB migrations applied"))
      .catch((err) => logger.warn("DB migration failed", { error: err.message }));
  }

  return NextResponse.json({
    ok: true,
    service: "india2world-frontend-api",
    version: "0.3.0",
    features: {
      chat: !!(ENV.OPENAI_API_KEY || ENV.GEMINI_API_KEY),
      agent: !!((ENV.OPENAI_API_KEY || ENV.GEMINI_API_KEY) && ENV.TAVILY_API_KEY),
      news: !!ENV.TAVILY_API_KEY,
      schemeMatcher: !!ENV.OPENAI_API_KEY,
      hsClassifier: !!ENV.OPENAI_API_KEY,
      database: !!ENV.DATABASE_URL,
      auth: !!ENV.CLERK_SECRET_KEY,
      providers: {
        openai: !!ENV.OPENAI_API_KEY,
        gemini: !!ENV.GEMINI_API_KEY,
      },
    },
  });
}
