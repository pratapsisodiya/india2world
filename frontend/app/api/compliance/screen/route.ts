import { NextRequest, NextResponse } from "next/server";
import { ComplianceScreeningRequestSchema } from "@/lib/server/types";
import { screenEntity } from "@/lib/server/features/compliance/complianceService";
import { logger } from "@/lib/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ComplianceScreeningRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const abortController = new AbortController();

  try {
    const result = await screenEntity(parsed.data, abortController.signal);
    return NextResponse.json(result);
  } catch (err) {
    if (abortController.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    logger.error("compliance screening error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to screen entity." },
      { status: 502 }
    );
  }
}
