import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPool } from "@/lib/server/config/db";
import { logger } from "@/lib/server/utils/logger";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, title, provider, created_at, updated_at
       FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50`,
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    logger.error("get sessions error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load sessions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, title, provider } = body;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO chat_sessions (id, user_id, title, provider)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()`,
      [id, userId, title ?? "Untitled", provider ?? "openai"]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("save session error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save session." }, { status: 500 });
  }
}
