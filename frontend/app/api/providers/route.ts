import { NextResponse } from "next/server";
import { ENV } from "@/lib/server/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    available: [ENV.OPENAI_API_KEY ? "openai" : null, ENV.GEMINI_API_KEY ? "gemini" : null].filter(Boolean),
    default: "openai",
    models: {
      openai: "gpt-4o-mini",
      gemini: "gemini-2.0-flash",
    },
  });
}
