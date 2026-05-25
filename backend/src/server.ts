import { ENV } from "./config/env.js";
import { logger } from "./utils/logger.js";
import app from "./app.js";
import { runMigrations } from "./config/db.js";

// ── Start ─────────────────────────────────────────────────────────────────────
// Run DB migrations if DATABASE_URL is set
if (ENV.DATABASE_URL) {
  runMigrations()
    .then(() => logger.info("DB migrations applied"))
    .catch((err) => logger.warn("DB migration failed (non-fatal)", { error: err.message }));
}

const server = app.listen(ENV.PORT, () => {
  logger.info(`india2world-backend v0.3.0 listening`, { port: ENV.PORT });
  logger.info(`CORS origins`, { origins: ENV.FRONTEND_ORIGINS });

  const missing = [
    !ENV.OPENAI_API_KEY && "OPENAI_API_KEY",
    !ENV.DATABASE_URL && "DATABASE_URL (optional — user data disabled)",
    !ENV.CLERK_SECRET_KEY && "CLERK_SECRET_KEY (optional — auth disabled)",
    !ENV.GEMINI_API_KEY && "GEMINI_API_KEY (optional — Gemini provider disabled)",
    !ENV.TAVILY_API_KEY && "TAVILY_API_KEY (optional — agent & news disabled)",
  ].filter(Boolean);

  if (missing.length) {
    missing.forEach((m) => logger.warn(`missing env: ${m}`));
  }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  // Force exit after 10s if connections don't drain
  setTimeout(() => {
    logger.error("forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
