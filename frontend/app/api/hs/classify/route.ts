import { NextRequest, NextResponse } from "next/server";
import { HsClassifierRequestSchema } from "@/lib/server/types";
import { classifyHsCode } from "@/lib/server/features/hsClassifier/hsClassifierService";
import { logger } from "@/lib/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = HsClassifierRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const abortController = new AbortController();

  try {
    const result = await classifyHsCode(parsed.data, abortController.signal);
    return NextResponse.json(result);
  } catch (err) {
    if (abortController.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    logger.error("hs classifier error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to classify HS code." },
      { status: 502 }
    );
  }
}
