import { NextRequest } from "next/server";
import { DocGeneratorRequestSchema } from "@/lib/server/types";
import { getOpenAIClient, OPENAI_MODEL_LARGE } from "@/lib/server/providers/openai";
import { createSseStream } from "@/lib/server/utils/sse";
import { logger } from "@/lib/server/utils/logger";

export const dynamic = "force-dynamic";

const DOC_LABELS: Record<string, string> = {
  "proforma-invoice": "Proforma Invoice",
  "commercial-invoice": "Commercial Invoice",
  "packing-list": "Packing List",
  "certificate-of-origin": "Certificate of Origin",
};

function buildDocPrompt(data: any): string {
  const label = DOC_LABELS[data.docType];
  const totalValue = data.products.reduce((sum: number, p: any) => sum + parseFloat(p.quantity) * p.unitPrice, 0);
  const currency = data.products[0]?.currency ?? "USD";

  const productLines = data.products
    .map((p: any, i: number) => `  ${i + 1}. ${p.description}${p.hsCode ? ` (HS: ${p.hsCode})` : ""} | Qty: ${p.quantity} | Unit: ${p.unitPrice} ${p.currency}`)
    .join("\n");

  return `Generate a professional export ${label} document for an Indian exporter.

Exporter: ${data.exporterName}
Address: ${data.exporterAddress}
Buyer: ${data.buyerName}
Buyer Address: ${data.buyerAddress}
Incoterm: ${data.incoterm ?? "FOB"}
Port of Loading: ${data.portOfLoading ?? "Mumbai, India"}
Port of Discharge: ${data.portOfDischarge ?? "As per buyer"}
Payment Terms: ${data.paymentTerms ?? "30% advance, 70% against BL copy"}

Products:
${productLines}

Format as a clean, professional ${label} with:
- Document header (India2World Export Solutions, reference number, date)
- All required fields per international trade standards
- Totals and amounts clearly shown in ${currency}
- Declaration clause appropriate for Indian exports
- Signature block for exporter

Use clear markdown formatting with tables for product lines. Include a compliance note at the bottom.`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = DocGeneratorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const abortController = new AbortController();

  const stream = createSseStream(async (send) => {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create(
        {
          model: OPENAI_MODEL_LARGE,
          max_tokens: 3000,
          messages: [{ role: "user", content: buildDocPrompt(parsed.data) }],
          stream: true,
        },
        { signal: abortController.signal },
      );

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) send({ type: "text", text: delta });
      }

      if (!abortController.signal.aborted) send({ type: "done" });
    } catch (err) {
      if (!abortController.signal.aborted) {
        logger.error("doc generator error", { error: err instanceof Error ? err.message : String(err) });
        send({ type: "error", message: err instanceof Error ? err.message : "Failed to generate document." });
      }
    }
  }, () => {
    abortController.abort();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
