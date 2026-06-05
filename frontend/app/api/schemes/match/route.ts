import { NextRequest, NextResponse } from "next/server";
import { SchemeMatcherRequestSchema } from "@/lib/server/types";
import { matchSchemes } from "@/lib/server/features/schemeMatcher/schemeMatcherService";
import { logger } from "@/lib/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SchemeMatcherRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const abortController = new AbortController();

  try {
    const result = await matchSchemes(parsed.data, abortController.signal);
    return NextResponse.json(result);
  } catch (err) {
    if (abortController.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    logger.error("scheme matcher error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to match schemes." },
      { status: 502 }
    );
  }
}
