import { ENV } from "../config/env";

type Level = "info" | "warn" | "error" | "debug";

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };

  if (ENV.NODE_ENV === "production") {
    // Structured JSON for log aggregators (Datadog, Logtail, etc.)
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    const metaStr = meta && Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    const prefix = `[${entry.ts}] [${level.toUpperCase()}]`;
    if (level === "error") {
      process.stderr.write(`${prefix} ${message}${metaStr}\n`);
    } else {
      process.stdout.write(`${prefix} ${message}${metaStr}\n`);
    }
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (ENV.NODE_ENV !== "production") log("debug", msg, meta);
  },
};
