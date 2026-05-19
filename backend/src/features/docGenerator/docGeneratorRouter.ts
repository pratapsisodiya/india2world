import express, { Request, Response } from "express";
import { DocGeneratorRequestSchema } from "../../types/index.js";
import { getOpenAIClient, OPENAI_MODEL_LARGE } from "../../providers/openai.js";
import { openSse, sendSse } from "../../utils/sse.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

const DOC_LABELS: Record<string, string> = {
  "proforma-invoice": "Proforma Invoice",
  "commercial-invoice": "Commercial Invoice",
  "packing-list": "Packing List",
  "certificate-of-origin": "Certificate of Origin",
};

function buildDocPrompt(data: ReturnType<typeof DocGeneratorRequestSchema.parse>): string {
  const label = DOC_LABELS[data.docType];
  const totalValue = data.products.reduce((sum, p) => sum + parseFloat(p.quantity) * p.unitPrice, 0);
  const currency = data.products[0]?.currency ?? "USD";

  const productLines = data.products
    .map((p, i) => `  ${i + 1}. ${p.description}${p.hsCode ? ` (HS: ${p.hsCode})` : ""} | Qty: ${p.quantity} | Unit: ${p.unitPrice} ${p.currency}`)
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

router.post("/api/docs/generate", async (req: Request, res: Response) => {
  const parsed = DocGeneratorRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const reqId = req.headers["x-request-id"] as string;
  const stopHeartbeat = openSse(res);
  const abort = new AbortController();
  req.on("close", () => { abort.abort(); stopHeartbeat(); });

  try {
    const client = getOpenAIClient();
    const stream = await client.chat.completions.create(
      {
        model: OPENAI_MODEL_LARGE,
        max_tokens: 3000,
        messages: [{ role: "user", content: buildDocPrompt(parsed.data) }],
        stream: true,
      },
      { signal: abort.signal },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) sendSse(res, { type: "text", text: delta });
    }

    if (!abort.signal.aborted) sendSse(res, { type: "done" });
  } catch (err) {
    if (!abort.signal.aborted) {
      logger.error("doc generator error", { reqId, error: err instanceof Error ? err.message : String(err) });
      sendSse(res, { type: "error", message: err instanceof Error ? err.message : "Failed to generate document." });
    }
  } finally {
    stopHeartbeat();
    res.end();
  }
});

export default router;
