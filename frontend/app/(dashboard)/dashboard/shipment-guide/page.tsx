"use client";

import { useState } from "react";
import {
  FileText,
  Ship,
  Plane,
  Package,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";

type Mode = "sea" | "air" | "courier";
type Incoterm = "FOB" | "CIF" | "DDP" | "EXW";

interface Step {
  id: number;
  title: string;
  phase: string;
  duration: string;
  desc: string;
  docs: string[];
  tips: string[];
  warnings?: string[];
}

const SEA_STEPS: Step[] = [
  {
    id: 1,
    phase: "Pre-export",
    title: "Receive & Review Purchase Order",
    duration: "Day 1",
    desc: "Receive the buyer's purchase order (PO). Verify product specs, quantity, price, payment terms, delivery schedule, and port of destination before accepting.",
    docs: ["Purchase Order (PO)", "Pro-forma Invoice (if issued earlier)", "IEC Certificate"],
    tips: [
      "Ensure payment terms (LC/TT/DP/DA) are clearly agreed before production.",
      "Verify HS code applicability for buyer's country to check for anti-dumping duties.",
      "If payment is via LC, review LC terms carefully before starting production.",
    ],
    warnings: ["Never start production before PO is confirmed in writing."],
  },
  {
    id: 2,
    phase: "Pre-export",
    title: "Production, Packing & Marking",
    duration: "Days 2–30",
    desc: "Manufacture/source goods as per order specifications. Pack and mark as per buyer's instructions and destination country regulations.",
    docs: ["Packing List (draft)", "Quality inspection report", "FSSAI/BIS/CE certificate (if applicable)"],
    tips: [
      "Export markings: Country of Origin, Net/Gross weight, HS code (on outer carton).",
      "Fumigation (ISPM-15) required for wooden packaging going to most countries.",
      "Photograph packing process for buyer's confidence and insurance claims.",
    ],
  },
  {
    id: 3,
    phase: "Pre-export",
    title: "Pre-shipment Inspection (if required)",
    duration: "3–5 days before loading",
    desc: "Certain buyers, commodities, or destination countries require third-party pre-shipment inspection (PSI) by agencies like SGS, Bureau Veritas, or APEDA.",
    docs: ["Inspection certificate", "Quality test report", "APEDA / commodity board certificate (if applicable)"],
    tips: [
      "Schedule inspection early — agencies may need 3–5 days notice.",
      "Required for: food exports (APEDA), agricultural commodities (FSSAI), many Middle East / Africa buyers.",
    ],
    warnings: ["Some LCs have mandatory PSI clause — missing it can cause payment refusal."],
  },
  {
    id: 4,
    phase: "Logistics",
    title: "Book Freight & Container",
    duration: "7–10 days before loading",
    desc: "Contact your freight forwarder or shipping line to book FCL (full container) or LCL (groupage) space. Confirm sailing schedule, cut-off dates.",
    docs: ["Shipping instruction to forwarder", "SI (Shipping Instructions) to shipping line", "Pre-alert from shipping line"],
    tips: [
      "LCL: generally for shipments below 15 CBM. FCL: 20' = 28 CBM, 40' = 58 CBM.",
      "Confirm port cut-off date (usually 3–4 days before ETD). Missing it delays shipment by a week.",
      "Get spot freight rates from 2–3 forwarders for best rate.",
    ],
  },
  {
    id: 5,
    phase: "Documentation",
    title: "Prepare Pre-shipment Documents",
    duration: "3–5 days before shipping bill",
    desc: "Prepare all commercial and shipping documents required for export clearance and buyer's payment.",
    docs: [
      "Commercial Invoice",
      "Packing List",
      "Certificate of Origin (COO) — from EPC / Chamber of Commerce",
      "GST LUT / RFD-11 (if applicable)",
      "ARE-1 / ARE-3 (for excisable goods)",
      "Phytosanitary certificate (for agri goods)",
      "Health certificate (for food)",
    ],
    tips: [
      "Invoice must state: price basis (FOB/CIF), payment terms, HS code, origin.",
      "For preferential COO (ASEAN, GCC): apply at respective Export Promotion Council.",
      "GST LUT must be filed fresh each financial year before first export.",
    ],
    warnings: ["Errors on invoice (wrong HS code, price discrepancy) can cause customs detention at destination."],
  },
  {
    id: 6,
    phase: "Customs",
    title: "File Shipping Bill & Export Clearance",
    duration: "2 days before stuffing",
    desc: "File Shipping Bill on ICEGATE (or through your CHA). Customs will examine/assess. After 'Let Export Order' (LEO), goods can be loaded.",
    docs: [
      "Shipping Bill (filed online via ICEGATE)",
      "Commercial Invoice & Packing List",
      "ARE-1 / Form 9 (for warehoused goods)",
      "IEC",
      "RCMC (for restricted commodities)",
    ],
    tips: [
      "Use a licensed CHA (Customs House Agent) for faster clearance and compliance.",
      "E-Sanchit: upload documents online to ICEGATE before examination.",
      "Claim duty drawback / RoDTEP directly on Shipping Bill — set correct scheme code.",
    ],
    warnings: ["LEO must be obtained before goods enter port/CFS. Without LEO, goods cannot be stuffed."],
  },
  {
    id: 7,
    phase: "Logistics",
    title: "Stuffing, Loading & Vessel Departure",
    duration: "1–2 days",
    desc: "Goods are transported to port / CFS, container is stuffed (FCL) or consolidated (LCL), and loaded onto vessel.",
    docs: ["EIR (Equipment Interchange Receipt)", "Stuffing report", "Seal number record"],
    tips: [
      "For FCL: get CHA to supervise stuffing to ensure container seal is intact.",
      "LCL: your goods are consolidated at CFS. You receive MBL + HBL.",
      "Track vessel AIS (marinetraffic.com) after departure.",
    ],
  },
  {
    id: 8,
    phase: "Post-shipment",
    title: "Obtain Bill of Lading (BL)",
    duration: "2–5 days after loading",
    desc: "Collect the original Bill of Lading (BL) from shipping line / forwarder. This is the most critical document — it's the title to the goods.",
    docs: [
      "Original Bill of Lading (3 originals, 3 non-negotiable copies)",
      "Freight invoice from shipping line",
      "Delivery order (if pre-paid freight)",
    ],
    tips: [
      "Review BL carefully: shipper, consignee, notify party, commodity, weight, seal number.",
      "For LC payments: BL must match LC terms exactly — even minor discrepancies cause payment refusal.",
      "Switch BL: if buyers wants to change consignee later, use switch BL at agent's office.",
    ],
    warnings: ["Lost OBL = lost cargo. Keep originals safe. Courier to buyer via DHL/FedEx with tracking."],
  },
  {
    id: 9,
    phase: "Post-shipment",
    title: "Dispatch Documents to Bank / Buyer",
    duration: "Within 21 days of shipment",
    desc: "Send original shipping documents to buyer's bank (for LC) or directly to buyer (for TT/DP/DA), as per agreed payment terms.",
    docs: [
      "Original BL (3 originals)",
      "Commercial Invoice",
      "Packing List",
      "COO (original)",
      "Insurance certificate (for CIF)",
      "Inspection certificate",
      "Bank covering schedule",
    ],
    tips: [
      "For LC: submit documents within 21 days of BL date (or LC expiry). Use negotiating bank.",
      "For TT: courier documents to buyer directly after receiving advance/payment.",
      "Get 'clean BL' before sending — any clause on BL can block LC payment.",
    ],
  },
  {
    id: 10,
    phase: "Post-shipment",
    title: "FIRC & Payment Realization",
    duration: "30–90 days after shipment",
    desc: "Receive foreign currency payment. Bank issues FIRC (Foreign Inward Remittance Certificate). Report to RBI via Form BRC.",
    docs: [
      "FIRC (Foreign Inward Remittance Certificate)",
      "Bank Realisation Certificate (BRC/eBRC on DGFT portal)",
      "Export General Manifest (EGM) reference",
    ],
    tips: [
      "eBRC must be filed on DGFT portal within 9 months of export date — required for duty drawback/RoDTEP.",
      "Keep FIRC safe — required for GST refund, drawback, and RCMC renewal.",
      "Monitor exchange rate — use forward cover to lock in rate if order is large.",
    ],
    warnings: ["BRC not filed within time can result in penalty under FEMA."],
  },
  {
    id: 11,
    phase: "Incentives",
    title: "Claim Duty Drawback & RoDTEP",
    duration: "Within 3 months of shipment",
    desc: "Claim your RoDTEP credit (scrip) and duty drawback refund on the Shipping Bill. Amount auto-credited to ICEGATE after EGM filing.",
    docs: [
      "Shipping Bill (LEO copy)",
      "eBRC",
      "Bank account linked to ICEGATE",
      "RoDTEP scrip transfer request (if applicable)",
    ],
    tips: [
      "RoDTEP scrips can be transferred / sold on ICEGATE platform.",
      "Drawback rate: check All Industry Rate (AIR) table on CBIC website.",
      "EPCG license fulfillment: export obligation fulfilled only after eBRC filed.",
    ],
  },
];

const AIR_STEPS: Step[] = [
  {
    id: 1,
    phase: "Pre-export",
    title: "Receive & Review Purchase Order",
    duration: "Day 1",
    desc: "Same as sea freight. Verify all terms, pricing, and delivery schedule.",
    docs: ["Purchase Order", "Pro-forma Invoice", "IEC Certificate"],
    tips: ["Air freight is typically 4–6× more expensive than sea. Ensure product value/margin justifies it."],
  },
  {
    id: 2,
    phase: "Pre-export",
    title: "Pack & Prepare Goods for Air",
    duration: "Days 2–15",
    desc: "Air cargo has strict weight and dimension limits. Pack efficiently — weight is billed at actual or volumetric (L×W×H/6000), whichever is higher.",
    docs: ["Packing List", "Dimension/weight declaration"],
    tips: [
      "Volumetric weight = (L×W×H in cm) ÷ 6000. If higher than actual weight, you pay volumetric.",
      "Dangerous goods (batteries, chemicals) require IATA DGR compliance and special labeling.",
    ],
  },
  {
    id: 3,
    phase: "Documentation",
    title: "Prepare Air Export Documents",
    duration: "1–2 days",
    desc: "Air export documentation is similar to sea but uses Air Waybill (AWB) instead of BL. AWB is non-negotiable.",
    docs: ["Air Waybill (MAWB + HAWB)", "Commercial Invoice", "Packing List", "COO", "Shipping Bill"],
    tips: [
      "AWB is a receipt — not a title document like BL. Buyer gets goods on arrival without original AWB.",
      "For perishable goods, arrange pre-clearance at destination.",
    ],
    warnings: ["Air cargo security screening is mandatory — goods must arrive at airport 4–6 hours before departure."],
  },
  {
    id: 4,
    phase: "Customs",
    title: "File Shipping Bill at Air Customs",
    duration: "Same day as loading",
    desc: "File Shipping Bill on ICEGATE (same as sea). LEO must be obtained before goods are handed over to airline.",
    docs: ["Shipping Bill", "MSDS (for DG goods)", "Health/FSSAI certificate (for food)"],
    tips: ["Use airport-based CHA for faster processing. Many airports have 24/7 customs."],
  },
  {
    id: 5,
    phase: "Post-shipment",
    title: "Airway Bill & Document Dispatch",
    duration: "Same day as flight",
    desc: "Receive MAWB from airline/forwarder. Dispatch documents to buyer (courier or email for non-LC) immediately.",
    docs: ["MAWB / HAWB", "Commercial Invoice", "Packing List", "COO"],
    tips: ["Air cargo can reach buyer in 1–5 days. Send documents by email (scan) immediately so buyer can arrange clearance."],
  },
  {
    id: 6,
    phase: "Post-shipment",
    title: "Payment & FIRC",
    duration: "Typically T+7 to T+30",
    desc: "Receive payment. Get FIRC. File eBRC on DGFT. Claim drawback and RoDTEP.",
    docs: ["FIRC", "eBRC", "Shipping Bill LEO copy"],
    tips: ["Air exports are usually on TT advance — payment received before or shortly after shipment."],
  },
];

const COURIER_STEPS: Step[] = [
  {
    id: 1,
    phase: "Prep",
    title: "Pack & Weigh Shipment",
    duration: "1 day",
    desc: "Pack goods securely. Check courier's size and weight limits. DHL/FedEx/UPS typically allow up to 70 kg per piece.",
    docs: ["Commercial Invoice (3 copies)", "Packing List"],
    tips: ["For B2B exports via courier: use DHL Express Business account for better rates.", "Declare correct value — under-declaration for customs leads to detention."],
  },
  {
    id: 2,
    phase: "Customs",
    title: "Customs Declaration & KYC",
    duration: "30 minutes online",
    desc: "Fill courier's online export declaration. Provide IEC, GSTIN, commercial invoice. Courier files Shipping Bill on your behalf for exports over ₹25,000.",
    docs: ["IEC", "GSTIN certificate", "Commercial Invoice", "KYC documents"],
    tips: ["Courier exports are simpler — courier's CHA handles customs. You just provide documents.", "For samples below ₹10,000: GR waiver applies, no FEMA declaration needed."],
    warnings: ["Exports over USD 500 equivalent require RBI-approved bank account for realization."],
  },
  {
    id: 3,
    phase: "Dispatch",
    title: "Hand over to Courier & Track",
    duration: "Same day",
    desc: "Drop shipment at courier centre or schedule pickup. Get AWB tracking number. Transit time: 3–5 days international.",
    docs: ["AWB receipt", "Pickup confirmation"],
    tips: ["Track via courier portal + inform buyer with AWB number immediately.", "Get insurance for high-value shipments."],
  },
  {
    id: 4,
    phase: "Payment",
    title: "Payment & FIRC",
    duration: "T+3 to T+14",
    desc: "For sample/small exports, TT advance is typical. Get FIRC from bank. For regular courier exports, file eBRC on DGFT.",
    docs: ["FIRC", "eBRC (if applicable)"],
    tips: ["Courier exports under ₹5 Lakh per transaction are simpler from a compliance perspective."],
  },
];

const MODE_STEPS: Record<Mode, Step[]> = {
  sea: SEA_STEPS,
  air: AIR_STEPS,
  courier: COURIER_STEPS,
};

const PHASES_ORDER = ["Pre-export", "Logistics", "Documentation", "Customs", "Post-shipment", "Incentives", "Prep", "Dispatch", "Payment"];

function phaseColor(phase: string) {
  const map: Record<string, string> = {
    "Pre-export": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Logistics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Documentation: "bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400",
    Customs: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Post-shipment": "bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400",
    Incentives: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Prep: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300",
    Dispatch: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Payment: "bg-india-green-100 text-india-green-700 dark:bg-india-green-900/30 dark:text-india-green-400",
  };
  return map[phase] ?? "bg-zinc-100 text-zinc-600";
}

export default function ShipmentGuidePage() {
  const [mode, setMode] = useState<Mode>("sea");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const steps = MODE_STEPS[mode];

  function toggleComplete(id: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const completedCount = steps.filter((s) => completedSteps.has(s.id)).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Ship className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Shipment Process Guide
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Step-by-step walkthrough from receiving a purchase order to realizing payment — with documents and tips at each stage.
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-3 mb-6">
          {([
            { id: "sea", label: "Sea Freight", icon: Ship },
            { id: "air", label: "Air Freight", icon: Plane },
            { id: "courier", label: "Courier", icon: Zap },
          ] as const).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setCompletedSteps(new Set()); setExpandedStep(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  mode === m.id
                    ? "bg-saffron-500 border-saffron-500 text-white"
                    : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-saffron-300 bg-white dark:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-zinc-500">Progress</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{completedCount}/{steps.length} steps</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-india-green-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {completedCount === steps.length && (
            <div className="flex items-center gap-1.5 text-india-green-600 dark:text-india-green-400 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Done!
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.has(step.id);
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`rounded-2xl bg-white dark:bg-zinc-900 border transition-colors overflow-hidden ${
                  isCompleted
                    ? "border-india-green-300 dark:border-india-green-800"
                    : isExpanded
                    ? "border-saffron-300 dark:border-saffron-700"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {/* Step header */}
                <div className="flex items-start gap-3 p-4">
                  <button
                    onClick={() => toggleComplete(step.id)}
                    className="mt-0.5 shrink-0"
                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-india-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600 hover:text-saffron-400 transition-colors" />
                    )}
                  </button>

                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className="flex-1 text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${phaseColor(step.phase)}`}>
                          {step.phase}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {step.duration}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm font-semibold ${isCompleted ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-800 dark:text-zinc-100"}`}>
                        Step {step.id}: {step.title}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
                    )}
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-5 flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>

                    {/* Documents */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Documents needed
                      </p>
                      <ul className="flex flex-col gap-1">
                        {step.docs.map((doc) => (
                          <li key={doc} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-saffron-400 shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Tips</p>
                      <ul className="flex flex-col gap-1.5">
                        {step.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="mt-1 text-india-green-500 font-bold shrink-0">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Warnings */}
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 flex flex-col gap-1.5">
                        {step.warnings.map((w) => (
                          <div key={w} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{w}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mark done button */}
                    <button
                      onClick={() => toggleComplete(step.id)}
                      className={`self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isCompleted
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          : "bg-india-green-50 dark:bg-india-green-900/20 border border-india-green-300 dark:border-india-green-700 text-india-green-700 dark:text-india-green-400 hover:bg-india-green-100 dark:hover:bg-india-green-900/30"
                      }`}
                    >
                      {isCompleted ? (
                        <><Circle className="h-4 w-4" /> Mark incomplete</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4" /> Mark as done</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-6 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 flex items-start gap-3">
          <Package className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            This guide covers standard procedures. Actual requirements may vary by product, destination country, and buyer agreement. Always consult a licensed CHA (Customs House Agent) for product-specific compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
