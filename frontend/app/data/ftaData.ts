export type FtaName =
  | "India-UAE CEPA"
  | "India-Australia ECTA"
  | "India-ASEAN"
  | "India-Japan CEPA"
  | "India-Korea CEPA"
  | "SAFTA";

export type FtaCountryInfo = {
  fta: FtaName;
  cooForm: string;
  cooIssuingBody: string;
  cooProcess: string;
  rooSummary: string;
  partnerCountries?: string[];
};

export const FTA_COUNTRY_MAP: Record<string, FtaCountryInfo> = {
  AE: {
    fta: "India-UAE CEPA",
    cooForm: "Combined Declaration and Certificate (Form-I)",
    cooIssuingBody: "DGFT Regional Authority or authorised Export Promotion Council",
    cooProcess:
      "Apply online at DGFT portal (dgft.gov.in) with invoice, packing list, and manufacturing declaration. Certificate issued within 3-5 working days. Attach to shipping documents.",
    rooSummary:
      "30% value addition in India OR a change in tariff heading (CTH) at 4-digit HS level. Certificate of Origin must state CEPA origin criterion.",
  },
  AU: {
    fta: "India-Australia ECTA",
    cooForm: "Certificate of Origin (Form CO)",
    cooIssuingBody: "Export Inspection Council (EIC) or authorised issuing body",
    cooProcess:
      "Apply at Export Inspection Agency (EIA) or authorised agency. Submit manufacturing cost statement, invoice, and packing list. Processing: 3-5 days.",
    rooSummary:
      "Minimum 20% value addition in India. For textiles/garments: yarn-forward rule applies (must be manufactured from Indian/ECTA origin yarn). Verify chapter-specific rules.",
  },
  SG: {
    fta: "India-ASEAN",
    cooForm: "Form AI (AIFTA Certificate of Origin)",
    cooIssuingBody: "Directorate General of Foreign Trade (DGFT) or authorised EPCs",
    cooProcess:
      "Apply at DGFT Regional Authority with Form AI, commercial invoice, packing list, and production/cost statement. Certificate valid for 12 months.",
    rooSummary: "ASEAN-India FTA: 35% ASEAN/India value content OR specific change in tariff heading.",
    partnerCountries: ["SG", "MY", "TH", "ID", "PH", "VN", "MM", "KH", "LA", "BN"],
  },
  MY: {
    fta: "India-ASEAN",
    cooForm: "Form AI (AIFTA Certificate of Origin)",
    cooIssuingBody: "DGFT Regional Authority or authorised EPCs",
    cooProcess:
      "Apply at DGFT Regional Authority. Form AI required. Submit with invoice, packing list, manufacturing process note.",
    rooSummary: "35% ASEAN/India value content OR CTH at 4-digit HS level.",
    partnerCountries: ["SG", "MY", "TH", "ID", "PH", "VN", "MM", "KH", "LA", "BN"],
  },
  JP: {
    fta: "India-Japan CEPA",
    cooForm: "Certificate of Origin (Annex 2 format)",
    cooIssuingBody: "Export Inspection Council (EIC) or Federation of Indian Export Organisations (FIEO)",
    cooProcess:
      "Apply at EIC or FIEO. Submit origin determination sheet, invoice, and packing list. Processing: 3-5 working days.",
    rooSummary:
      "Product-specific rules (PSR) apply. Most goods: CTH + 40% value addition. Textiles: fibre-forward or yarn-forward. Check IJCEPA product-specific annex.",
  },
  KR: {
    fta: "India-Korea CEPA",
    cooForm: "Certificate of Origin (IKCEPA format)",
    cooIssuingBody: "Export Inspection Council (EIC) or authorised issuing bodies",
    cooProcess:
      "Apply at EIC or authorised body. Submit production/cost statement, invoice, packing list. Processing: 3-5 days.",
    rooSummary:
      "CTH at 6-digit level + 30% value addition for most goods. Textiles have specific fibre-forward or yarn-forward rules.",
  },
  BD: {
    fta: "SAFTA",
    cooForm: "SAFTA Certificate of Origin",
    cooIssuingBody: "DGFT Regional Authority or EPCs",
    cooProcess:
      "Apply at DGFT Regional Authority. Submit SAFTA CoO form with invoice and packing list. Land customs stations accept electronic submissions.",
    rooSummary:
      "30% value addition for LDC member countries (Bangladesh, Nepal, Bhutan, Maldives). Non-LDC members: 40% value addition.",
    partnerCountries: ["BD", "NP", "LK", "PK", "BT", "MV", "AF"],
  },
  NP: {
    fta: "SAFTA",
    cooForm: "SAFTA Certificate of Origin",
    cooIssuingBody: "DGFT Regional Authority or EPCs",
    cooProcess:
      "Apply at DGFT Regional Authority. Open border trade via land customs stations.",
    rooSummary: "30% value addition (Nepal is LDC member).",
    partnerCountries: ["BD", "NP", "LK", "PK", "BT", "MV", "AF"],
  },
  LK: {
    fta: "SAFTA",
    cooForm: "SAFTA Certificate of Origin",
    cooIssuingBody: "DGFT Regional Authority or EPCs",
    cooProcess:
      "Apply at DGFT Regional Authority. Sea route via Chennai/Tuticorin to Colombo. India-Sri Lanka bilateral FTA also available.",
    rooSummary: "35% value addition for Sri Lanka under SAFTA.",
    partnerCountries: ["BD", "NP", "LK", "PK", "BT", "MV", "AF"],
  },
};

export type DutyRateEntry = {
  hsChapterPattern: string;
  destinationCode: string;
  mfnDutyRate: string;
  mfnDutyPct: number;
  preferentialRate: string;
  preferentialPct: number;
  fta: FtaName;
  notes: string;
};

// Top chapter × country pairs covering most common Indian exports
export const DUTY_RATE_TABLE: DutyRateEntry[] = [
  // UAE CEPA
  { hsChapterPattern: "09", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%", preferentialPct: 0, fta: "India-UAE CEPA", notes: "Spices: UAE CEPA eliminates duty. Applies to chapters 09.04–09.10." },
  { hsChapterPattern: "61", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%", preferentialPct: 0, fta: "India-UAE CEPA", notes: "Knitted apparel: zero duty under CEPA." },
  { hsChapterPattern: "62", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%", preferentialPct: 0, fta: "India-UAE CEPA", notes: "Woven apparel: zero duty under CEPA." },
  { hsChapterPattern: "71", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%", preferentialPct: 0, fta: "India-UAE CEPA", notes: "Gems & jewellery: zero duty under CEPA. Major benefit for India's gems sector." },
  { hsChapterPattern: "30", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%", preferentialPct: 0, fta: "India-UAE CEPA", notes: "Pharma formulations: zero duty under CEPA." },
  { hsChapterPattern: "84", destinationCode: "AE", mfnDutyRate: "5%", mfnDutyPct: 5, preferentialRate: "0%–2.5%", preferentialPct: 1.25, fta: "India-UAE CEPA", notes: "Machinery: mostly zero, some items at 2.5% during phase-in." },

  // Australia ECTA
  { hsChapterPattern: "09", destinationCode: "AU", mfnDutyRate: "0%–5%", mfnDutyPct: 2.5, preferentialRate: "0%", preferentialPct: 0, fta: "India-Australia ECTA", notes: "Most spices already at 0% MFN in Australia. ECTA locks in zero permanently." },
  { hsChapterPattern: "61", destinationCode: "AU", mfnDutyRate: "10%", mfnDutyPct: 10, preferentialRate: "0%", preferentialPct: 0, fta: "India-Australia ECTA", notes: "Apparel: 10% MFN → 0% under ECTA. Major advantage for Indian garment exporters." },
  { hsChapterPattern: "62", destinationCode: "AU", mfnDutyRate: "10%", mfnDutyPct: 10, preferentialRate: "0%", preferentialPct: 0, fta: "India-Australia ECTA", notes: "Woven apparel: same as knitted — 10% → 0% under ECTA." },
  { hsChapterPattern: "30", destinationCode: "AU", mfnDutyRate: "4%", mfnDutyPct: 4, preferentialRate: "0%", preferentialPct: 0, fta: "India-Australia ECTA", notes: "Pharma: 4% MFN → 0% under ECTA. Verify TGA registration requirements separately." },

  // Japan CEPA
  { hsChapterPattern: "09", destinationCode: "JP", mfnDutyRate: "0%–15%", mfnDutyPct: 7.5, preferentialRate: "0%–5%", preferentialPct: 2.5, fta: "India-Japan CEPA", notes: "Spices: varies by product. Black pepper MFN 4.2%→0% under CEPA." },
  { hsChapterPattern: "61", destinationCode: "JP", mfnDutyRate: "11.2%", mfnDutyPct: 11.2, preferentialRate: "0%", preferentialPct: 0, fta: "India-Japan CEPA", notes: "Knitted garments: CEPA eliminates 11.2% duty. Yarn-forward RoO applies." },
  { hsChapterPattern: "30", destinationCode: "JP", mfnDutyRate: "0%–4.7%", mfnDutyPct: 2.4, preferentialRate: "0%", preferentialPct: 0, fta: "India-Japan CEPA", notes: "Most pharma already at 0% MFN in Japan. CEPA secures access." },

  // Korea CEPA
  { hsChapterPattern: "61", destinationCode: "KR", mfnDutyRate: "13%", mfnDutyPct: 13, preferentialRate: "0%", preferentialPct: 0, fta: "India-Korea CEPA", notes: "Apparel: 13% MFN → 0% under CEPA. Strong opportunity for Indian exporters." },
  { hsChapterPattern: "30", destinationCode: "KR", mfnDutyRate: "8%", mfnDutyPct: 8, preferentialRate: "0%", preferentialPct: 0, fta: "India-Korea CEPA", notes: "Pharma: 8% MFN → 0% under CEPA." },
  { hsChapterPattern: "84", destinationCode: "KR", mfnDutyRate: "8%", mfnDutyPct: 8, preferentialRate: "0%–4%", preferentialPct: 2, fta: "India-Korea CEPA", notes: "Engineering goods: phased reduction to zero or near-zero." },

  // ASEAN (Singapore as representative)
  { hsChapterPattern: "09", destinationCode: "SG", mfnDutyRate: "0%", mfnDutyPct: 0, preferentialRate: "0%", preferentialPct: 0, fta: "India-ASEAN", notes: "Singapore has near-zero tariffs on most goods. ASEAN CoO still enables onward re-export to other ASEAN markets at AIFTA rates." },
  { hsChapterPattern: "61", destinationCode: "SG", mfnDutyRate: "0%", mfnDutyPct: 0, preferentialRate: "0%", preferentialPct: 0, fta: "India-ASEAN", notes: "Singapore: zero duty. Use AIFTA CoO to access Malaysia, Thailand, Vietnam at preferential rates." },
  { hsChapterPattern: "61", destinationCode: "MY", mfnDutyRate: "20%–25%", mfnDutyPct: 22.5, preferentialRate: "0%–5%", preferentialPct: 2.5, fta: "India-ASEAN", notes: "Malaysian apparel import duty reduced significantly under AIFTA." },

  // SAFTA
  { hsChapterPattern: "09", destinationCode: "BD", mfnDutyRate: "20%–25%", mfnDutyPct: 22.5, preferentialRate: "0%–5%", preferentialPct: 2.5, fta: "SAFTA", notes: "Spices: significant duty reduction under SAFTA. Check sensitive list." },
  { hsChapterPattern: "61", destinationCode: "BD", mfnDutyRate: "25%–37%", mfnDutyPct: 31, preferentialRate: "0%–12%", preferentialPct: 6, fta: "SAFTA", notes: "Textiles: Bangladesh imports significant duty reductions under SAFTA." },
];

export function getDutyRates(hsChapter: string, destCode: string): DutyRateEntry | null {
  return (
    DUTY_RATE_TABLE.find(
      (r) => r.hsChapterPattern === hsChapter && r.destinationCode === destCode
    ) ?? null
  );
}

export function calculateSavings(fobAmount: number, mfnPct: number, preferentialPct: number) {
  const mfnDuty = (fobAmount * mfnPct) / 100;
  const preferentialDuty = (fobAmount * preferentialPct) / 100;
  const saving = mfnDuty - preferentialDuty;
  return { mfnDuty, preferentialDuty, saving };
}
