import { Pool } from "pg";
import { ENV } from "./env";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    if (!ENV.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
    _pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return _pool;
}

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,          -- Clerk user ID
      email       TEXT NOT NULL,
      name        TEXT,
      sector      TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id            TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      business_name      TEXT,
      business_type      TEXT,
      sector             TEXT,
      location           TEXT,
      export_products    TEXT,
      target_markets     TEXT[],
      export_stage       TEXT,
      preferred_currency TEXT DEFAULT 'USD',
      compliance_focus   TEXT[],
      has_iec            BOOLEAN DEFAULT FALSE,
      iso_verified       BOOLEAN DEFAULT FALSE,
      readiness_score    INT,
      onboarding_complete BOOLEAN DEFAULT FALSE,
      updated_at         TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      id          SERIAL PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type   TEXT NOT NULL,  -- 'scheme' | 'glossary' | 'hs_code' | 'country'
      item_id     TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT,
      provider    TEXT DEFAULT 'claude',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id          SERIAL PRIMARY KEY,
      session_id  TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role        TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id, item_type);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
  `);
}
