import express, { Request, Response } from "express";
import { requireAuth, AuthedRequest } from "../../middleware/auth.js";
import { getPool } from "../../config/db.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

// ── Upsert user on first sign-in ─────────────────────────────────────────────
router.post("/api/user/sync", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { email, name, sector } = req.body as { email?: string; name?: string; sector?: string };

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
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
    res.json({ ok: true });
  } catch (err) {
    logger.error("user sync error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to sync user." });
  }
});

// ── Get profile ───────────────────────────────────────────────────────────────
router.get("/api/user/profile", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT up.*, u.email, u.name
       FROM user_profiles up
       RIGHT JOIN users u ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    res.json(result.rows[0] ?? { user_id: userId });
  } catch (err) {
    logger.error("get profile error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to load profile." });
  }
});

// ── Save / update profile ─────────────────────────────────────────────────────
router.put("/api/user/profile", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const {
    business_name, business_type, sector, location, export_products,
    target_markets, export_stage, preferred_currency, compliance_focus,
    has_iec, iso_verified, readiness_score, onboarding_complete,
  } = req.body;

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
    res.json({ ok: true });
  } catch (err) {
    logger.error("update profile error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// ── Saved items ───────────────────────────────────────────────────────────────
router.get("/api/user/saved", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
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
    res.json(grouped);
  } catch (err) {
    logger.error("get saved error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to load saved items." });
  }
});

router.post("/api/user/saved", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { item_type, item_id } = req.body as { item_type?: string; item_id?: string };
  if (!item_type || !item_id) {
    res.status(400).json({ error: "item_type and item_id are required" });
    return;
  }
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [userId, item_type, item_id]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error("save item error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to save item." });
  }
});

router.delete("/api/user/saved", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { item_type, item_id } = req.body as { item_type?: string; item_id?: string };
  if (!item_type || !item_id) {
    res.status(400).json({ error: "item_type and item_id are required" });
    return;
  }
  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
      [userId, item_type, item_id]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error("unsave item error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to remove saved item." });
  }
});

// ── Chat sessions ─────────────────────────────────────────────────────────────
router.get("/api/user/sessions", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, title, provider, created_at, updated_at
       FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error("get sessions error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to load sessions." });
  }
});

router.post("/api/user/sessions", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { id, title, provider } = req.body as { id: string; title?: string; provider?: string };
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO chat_sessions (id, user_id, title, provider)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()`,
      [id, userId, title ?? "Untitled", provider ?? "openai"]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error("save session error", { userId, error: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: "Failed to save session." });
  }
});

export default router;
