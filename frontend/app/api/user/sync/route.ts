import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPool } from "@/lib/server/config/db";
import { logger } from "@/lib/server/utils/logger";

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

  const { email, name, sector } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO users (id, email, name, sector, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             name  = COALESCE(EXCLUDED.name, users.name),
             sector = COALESCE(EXCLUDED.sector, users.sector),
             updated_at = NOW()`,
      [userId, email, name ?? null, sector ?? null]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("user sync error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to sync user." }, { status: 500 });
  }
}
