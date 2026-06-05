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
      `SELECT item_type, item_id, created_at FROM saved_items WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    const grouped: Record<string, string[]> = {};
    for (const row of result.rows) {
      grouped[row.item_type] ??= [];
      grouped[row.item_type].push(row.item_id);
    }
    return NextResponse.json(grouped);
  } catch (err) {
    logger.error("get saved error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load saved items." }, { status: 500 });
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

  const { item_type, item_id } = body;
  if (!item_type || !item_id) {
    return NextResponse.json({ error: "item_type and item_id are required" }, { status: 400 });
  }

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [userId, item_type, item_id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("save item error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save item." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

  const { item_type, item_id } = body;
  if (!item_type || !item_id) {
    return NextResponse.json({ error: "item_type and item_id are required" }, { status: 400 });
  }

  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
      [userId, item_type, item_id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("unsave item error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to remove saved item." }, { status: 500 });
  }
}
