export type RegistrationStatus =
  | "iec"
  | "gst"
  | "gst-lut"
  | "rcmc"
  | "product-licence";

export type TurnoverRange =
  | "under-50L"
  | "50L-1Cr"
  | "1Cr-5Cr"
  | "5Cr-25Cr"
  | "above-25Cr";

export type ExperienceLevel =
  | "never"
  | "exploring"
  | "first-shipment"
  | "scaling";

export type ReadinessAnswer = {
  sector: string;
  products: string;
  registrations: RegistrationStatus[];
  targetMarket: string;
  turnoverRange: TurnoverRange;
  experienceLevel: ExperienceLevel;
};

export type ReadinessScore = {
  total: number;
  documentation: number;
  marketKnowledge: number;
  financialReadiness: number;
  compliance: number;
};

const PHARMA_FOOD_SECTORS = [
  "Pharma & life sciences",
  "Spices & agri",
  "Spices & Agriculture",
];

export function computeReadinessScore(a: ReadinessAnswer): ReadinessScore {
  // Documentation & Registration (max 25)
  let documentation = 0;
  if (a.registrations.includes("iec")) documentation += 8;
  if (a.registrations.includes("gst")) documentation += 4;
  if (a.registrations.includes("gst-lut")) documentation += 5;
  if (a.registrations.includes("rcmc")) documentation += 5;
  if (a.registrations.includes("product-licence")) documentation += 3;

  // Market Knowledge (max 25)
  let marketKnowledge = 0;
  if (a.targetMarket) marketKnowledge += 10;
  const expMap: Record<ExperienceLevel, number> = {
    never: 0,
    exploring: 5,
    "first-shipment": 15,
    scaling: 25,
  };
  marketKnowledge = Math.min(25, marketKnowledge + expMap[a.experienceLevel]);

  // Financial Readiness (max 25)
  const turnoverMap: Record<TurnoverRange, number> = {
    "under-50L": 5,
    "50L-1Cr": 10,
    "1Cr-5Cr": 15,
    "5Cr-25Cr": 20,
    "above-25Cr": 25,
  };
  const financialReadiness = turnoverMap[a.turnoverRange];

  // Compliance (max 25)
  let compliance = 0;
  const isPharmFood = PHARMA_FOOD_SECTORS.some((s) =>
    a.sector.toLowerCase().includes(s.toLowerCase().split(" ")[0])
  );
  if (isPharmFood) {
    if (a.registrations.includes("product-licence")) compliance = 25;
    else if (a.registrations.includes("rcmc")) compliance = 15;
    else if (a.registrations.includes("iec")) compliance = 8;
  } else {
    if (a.registrations.includes("rcmc") && a.registrations.includes("iec"))
      compliance = 20;
    else if (a.registrations.includes("iec")) compliance = 12;
    else if (a.registrations.includes("gst")) compliance = 6;
  }

  const total = Math.min(
    100,
    documentation + marketKnowledge + financialReadiness + compliance
  );

  return { total, documentation, marketKnowledge, financialReadiness, compliance };
}

export function buildReadinessPrompt(
  a: ReadinessAnswer,
  score: ReadinessScore
): string {
  const missingRegs: string[] = [];
  if (!a.registrations.includes("iec")) missingRegs.push("IEC");
  if (!a.registrations.includes("gst")) missingRegs.push("GST");
  if (!a.registrations.includes("gst-lut")) missingRegs.push("GST LUT");
  if (!a.registrations.includes("rcmc")) missingRegs.push("RCMC");
  if (!a.registrations.includes("product-licence"))
    missingRegs.push("product-specific licence");

  return `I am assessing the export readiness of an Indian business.

Business profile:
- Sector: ${a.sector || "Not specified"}
- Products: ${a.products || "Not specified"}
- Completed registrations: ${a.registrations.length ? a.registrations.join(", ").toUpperCase().replace(/-/g, " ") : "None"}
- Missing: ${missingRegs.length ? missingRegs.join(", ") : "None"}
- Target market: ${a.targetMarket || "Not decided yet"}
- Annual turnover range: ${a.turnoverRange}
- Export experience: ${a.experienceLevel}

Computed readiness scores:
- Documentation & Registration: ${score.documentation}/25
- Market Knowledge: ${score.marketKnowledge}/25
- Financial Readiness: ${score.financialReadiness}/25
- Compliance & Licensing: ${score.compliance}/25
- Total: ${score.total}/100

Please respond with:
1. A brief validation of the score (1–2 sentences — does this seem right for this profile?).
2. The 5 most important actions this business should take next, ordered by priority. Format each as:
**Action N: [Title]** — [one sentence explanation] — [where to go / portal name]
3. One sentence of encouragement at the end.`;
}
