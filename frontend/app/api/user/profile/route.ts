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
      `SELECT up.*, u.email, u.name
       FROM user_profiles up
       RIGHT JOIN users u ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return NextResponse.json(result.rows[0] ?? { user_id: userId });
  } catch (err) {
    logger.error("get profile error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

  const {
    business_name, business_type, sector, location, export_products,
    target_markets, export_stage, preferred_currency, compliance_focus,
    has_iec, iso_verified, readiness_score, onboarding_complete,
  } = body;

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO user_profiles (
         user_id, business_name, business_type, sector, location,
         export_products, target_markets, export_stage, preferred_currency,
         compliance_focus, has_iec, iso_verified, readiness_score,
         onboarding_complete, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         business_name = COALESCE(EXCLUDED.business_name, user_profiles.business_name),
         business_type = COALESCE(EXCLUDED.business_type, user_profiles.business_type),
         sector = COALESCE(EXCLUDED.sector, user_profiles.sector),
         location = COALESCE(EXCLUDED.location, user_profiles.location),
         export_products = COALESCE(EXCLUDED.export_products, user_profiles.export_products),
         target_markets = COALESCE(EXCLUDED.target_markets, user_profiles.target_markets),
         export_stage = COALESCE(EXCLUDED.export_stage, user_profiles.export_stage),
         preferred_currency = COALESCE(EXCLUDED.preferred_currency, user_profiles.preferred_currency),
         compliance_focus = COALESCE(EXCLUDED.compliance_focus, user_profiles.compliance_focus),
         has_iec = COALESCE(EXCLUDED.has_iec, user_profiles.has_iec),
         iso_verified = COALESCE(EXCLUDED.iso_verified, user_profiles.iso_verified),
         readiness_score = COALESCE(EXCLUDED.readiness_score, user_profiles.readiness_score),
         onboarding_complete = COALESCE(EXCLUDED.onboarding_complete, user_profiles.onboarding_complete),
         updated_at = NOW()`,
      [
        userId, business_name, business_type, sector, location,
        export_products, target_markets, export_stage, preferred_currency ?? "USD",
        compliance_focus, has_iec, iso_verified, readiness_score, onboarding_complete,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("update profile error", { userId, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
