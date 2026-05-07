export type Scheme = {
  id: string;
  name: string;
  shortName: string;
  category: "duty-remission" | "duty-exemption" | "financial" | "infrastructure" | "market-access";
  summary: string;
  eligibility: string[];
  benefit: string;
  howToClaim: string;
  applyAt: string;
  link: string;
  sectors: string[];
};

export const SCHEMES: Scheme[] = [
  {
    id: "rodtep",
    name: "Remission of Duties and Taxes on Exported Products",
    shortName: "RoDTEP",
    category: "duty-remission",
    summary:
      "Refunds embedded central, state and local taxes/duties/levies that are not rebated under any other scheme. Replaced MEIS from Jan 2021.",
    eligibility: [
      "Manufacturing exporters and merchant exporters",
      "Product must be in the notified RoDTEP schedule (check DGFT notification)",
      "Export through customs EDI ports",
      "IEC and GST registration required",
    ],
    benefit:
      "Transferable duty credit scrip (credited to ICEGATE e-scrip ledger) equivalent to a percentage of FOB value — rates vary by HS code (typically 0.5%–4.3%).",
    howToClaim:
      "Declare in shipping bill (claim 'Y' in RoDTEP field). Credits auto-credited to ICEGATE e-scrip ledger within days of EGM filing. Scrips can be used for paying customs duties or sold on the market.",
    applyAt: "Customs (ICEGATE) — no separate application. Declare at time of export.",
    link: "https://dgft.gov.in",
    sectors: ["textiles", "engineering", "pharma", "leather", "handicrafts", "spices", "it-ites"],
  },
  {
    id: "rosclt",
    name: "Rebate of State and Central Taxes and Levies",
    shortName: "RoSCTL",
    category: "duty-remission",
    summary:
      "Rebate of state and central taxes and levies for apparel and made-up articles of textiles. Specifically for clothing and made-ups (Chapters 61, 62, 63).",
    eligibility: [
      "Exporters of apparel (Chapter 61, 62) and made-ups (Chapter 63)",
      "Manufacturing or merchant exporters",
      "Exports from India with IEC",
    ],
    benefit:
      "Transferable duty credit scrip as a % of FOB value. Rates notified by MoT — typically higher than RoDTEP for apparel (up to 8%+ for some items).",
    howToClaim:
      "Declare in shipping bill. Credits flow to ICEGATE e-scrip ledger. Can be used to pay basic customs duty or sold.",
    applyAt: "ICEGATE — declared at export stage.",
    link: "https://dgft.gov.in",
    sectors: ["textiles"],
  },
  {
    id: "advance-authorisation",
    name: "Advance Authorisation (AA)",
    shortName: "Advance Auth.",
    category: "duty-exemption",
    summary:
      "Allows duty-free import of raw materials, components, and consumables required for manufacturing export products. Fulfil export obligation within 18 months.",
    eligibility: [
      "Manufacturer exporters",
      "Merchant exporters tied to a supporting manufacturer",
      "Product must have standard input-output norms (SION) or self-declared norms (Ad Hoc)",
      "Minimum value addition of 15% required",
    ],
    benefit:
      "Duty-free import (BCD, CVD, SAD waived) for inputs used in export product. Saves 15–30% on input costs for duty-sensitive industries.",
    howToClaim:
      "Apply online at DGFT portal for AA licence before importing. Specify SION or apply for Ad Hoc norms. After export fulfilment, apply for EODC (Export Obligation Discharge Certificate).",
    applyAt: "DGFT Regional Authority online portal (dgft.gov.in).",
    link: "https://dgft.gov.in",
    sectors: ["pharma", "engineering", "textiles", "gems", "leather"],
  },
  {
    id: "epcg",
    name: "Export Promotion Capital Goods Scheme",
    shortName: "EPCG",
    category: "duty-exemption",
    summary:
      "Allows import of capital goods (machinery, equipment) at zero customs duty for upgrading technology to manufacture export products.",
    eligibility: [
      "Manufacturer exporter or service provider",
      "Must have IEC and valid RCMC",
      "No export obligation default under previous EPCG licences",
    ],
    benefit:
      "Zero BCD on capital goods import. Export obligation = 6x CIF value of capital goods over 6 years (or 8x over 8 years for MSME). Saves significant upfront capital expenditure.",
    howToClaim:
      "Apply at DGFT for EPCG licence specifying capital goods. After import and installation, fulfil export obligation. Annual filings required. Apply for EODC at end of period.",
    applyAt: "DGFT Regional Authority (dgft.gov.in). Capital goods then imported through customs.",
    link: "https://dgft.gov.in",
    sectors: ["textiles", "engineering", "pharma", "leather", "gems"],
  },
  {
    id: "duty-drawback",
    name: "Duty Drawback",
    shortName: "Drawback",
    category: "duty-remission",
    summary:
      "Refund of customs duty, central excise duty paid on inputs used in manufacture of export goods. Two rates: All Industry Rate (AIR) and Brand Rate.",
    eligibility: [
      "All exporters — manufacturers and merchants",
      "Product must be in Drawback schedule OR file Brand Rate",
      "Must export within 18 months of import of inputs",
    ],
    benefit:
      "Cash refund (directly to bank account) as % of FOB export value (AIR) or actual duty paid (Brand Rate). Rate varies by HS code — check CBIC drawback schedule.",
    howToClaim:
      "Declare drawback claim in shipping bill. After EGM (Export General Manifest), amount auto-credited to exporter's bank account (typically 7–10 days). For Brand Rate: file with Customs within 3 months of export.",
    applyAt: "CBIC / Customs. Declared in shipping bill at export.",
    link: "https://cbic.gov.in",
    sectors: ["textiles", "engineering", "gems", "leather", "pharma", "spices"],
  },
  {
    id: "mai",
    name: "Market Access Initiative",
    shortName: "MAI",
    category: "market-access",
    summary:
      "Government grant scheme to support EPCs, industry bodies, and exporters in conducting market studies, participating in trade fairs, brand building, and opening overseas offices.",
    eligibility: [
      "Export Promotion Councils (EPCs)",
      "Industry/trade bodies",
      "Individual exporters (in some components)",
      "State governments for export promotion activities",
    ],
    benefit:
      "Up to 100% financial assistance (depending on scheme component) for market studies, trade fair participation, buyer-seller meets, warehousing abroad, brand promotion.",
    howToClaim:
      "Submit proposal to DGFT/MoC through EPC or directly. Annual call for proposals. Reimbursement after activity completion with proof of expenditure.",
    applyAt: "DGFT / Ministry of Commerce (dgft.gov.in/moci).",
    link: "https://dgft.gov.in",
    sectors: ["textiles", "handicrafts", "spices", "gems", "engineering", "pharma", "leather"],
  },
  {
    id: "seis",
    name: "Service Exports from India Scheme",
    shortName: "SEIS",
    category: "financial",
    summary:
      "Duty credit scrips for service exporters earning foreign exchange. Applicable for IT services, BPO, professional services, hospitality. Note: Under review; check current DGFT notifications for applicability.",
    eligibility: [
      "Service exporters earning minimum net foreign exchange of USD 15,000/year (individuals) or USD 10,000 (others)",
      "Must have IEC",
      "Services in notified list",
    ],
    benefit:
      "Transferable duty credit scrip at 3%–5% of net foreign exchange earned. Scrips usable for BCD payment or transferable.",
    howToClaim:
      "File online application at DGFT after end of financial year with CA-certified net foreign exchange earnings certificate.",
    applyAt: "DGFT online portal (dgft.gov.in).",
    link: "https://dgft.gov.in",
    sectors: ["it-ites"],
  },
  {
    id: "interest-equalisation",
    name: "Interest Equalisation Scheme",
    shortName: "Interest Equal.",
    category: "financial",
    summary:
      "Subsidises pre- and post-shipment rupee export credit interest rates for exporters. Reduces borrowing cost for working capital.",
    eligibility: [
      "MSME manufacturer exporters: 3% subvention on all export credit",
      "All exporters of 410 specified HS codes: 2% subvention",
      "Availed through designated banks",
    ],
    benefit:
      "3% reduction in export credit interest for MSMEs; 2% for notified HS codes. Significantly reduces cost of working capital for export manufacturing.",
    howToClaim:
      "Bank automatically applies subvention when disbursing export credit (pre-shipment / post-shipment). Exporter must declare MSME status and provide IEC. No separate application.",
    applyAt: "Through your AD Category 1 bank (lender).",
    link: "https://rbi.org.in",
    sectors: ["textiles", "engineering", "leather", "pharma", "handicrafts"],
  },
  {
    id: "deh",
    name: "Districts as Export Hubs",
    shortName: "DEH",
    category: "infrastructure",
    summary:
      "Government initiative to identify one or two key export products per district and provide end-to-end support — infrastructure, training, market linkages, single-window clearance.",
    eligibility: [
      "Exporters/manufacturers in notified DEH districts",
      "Products in the district's identified export basket",
    ],
    benefit:
      "Access to district-level export facilitation centre, priority infrastructure support, training, market intelligence, and facilitation by state DGFT offices.",
    howToClaim:
      "Contact District Export Hub committee through State government or DGFT Regional Authority for your district.",
    applyAt: "State government / DGFT Regional Authority in your district.",
    link: "https://dgft.gov.in",
    sectors: ["handicrafts", "spices", "textiles", "leather"],
  },
  {
    id: "tma",
    name: "Transport and Marketing Assistance",
    shortName: "TMA",
    category: "market-access",
    summary:
      "Financial assistance for freight cost of agricultural produce exports to specified markets (primarily long-haul destinations like US, EU, Australia).",
    eligibility: [
      "Exporters of specified agricultural commodities",
      "Exports to eligible countries (check APEDA/DGFT notification)",
      "APEDA registration required for most agri products",
    ],
    benefit:
      "Reimbursement of a portion of freight cost (air and sea) per MT of agricultural export. Rates vary by product and destination.",
    howToClaim:
      "File application with APEDA after export with supporting freight documents.",
    applyAt: "APEDA (Agricultural and Processed Food Products Export Development Authority).",
    link: "https://apeda.gov.in",
    sectors: ["spices"],
  },
  {
    id: "star-export-house",
    name: "Star Export House Status",
    shortName: "Star Export House",
    category: "market-access",
    summary:
      "Recognition status (One Star to Five Star) for exporters based on export performance. Higher status = faster customs clearance, priority treatment, extra scheme benefits.",
    eligibility: [
      "One Star: USD 3 million export in current/preceding 3 years",
      "Two Star: USD 25 million",
      "Three Star: USD 100 million",
      "Four Star: USD 500 million",
      "Five Star: USD 2,000 million",
    ],
    benefit:
      "Self-certification of documents, priority customs examination, simplified procedures, access to government Export Awards, enhanced credibility with buyers.",
    howToClaim:
      "Apply online at DGFT portal with export performance data. Automatic renewal on meeting criteria.",
    applyAt: "DGFT online portal (dgft.gov.in).",
    link: "https://dgft.gov.in",
    sectors: ["textiles", "engineering", "pharma", "gems", "leather"],
  },
  {
    id: "pcfc",
    name: "Pre-Shipment Credit in Foreign Currency",
    shortName: "PCFC",
    category: "financial",
    summary:
      "Short-term working capital in foreign currency (USD/EUR) at LIBOR/SOFR-linked rates, which are typically lower than rupee rates. Used to fund production/procurement before export shipment.",
    eligibility: [
      "Exporters with confirmed export orders or LC",
      "Availed through AD Category 1 banks",
      "Must repay within 360 days of disbursement",
    ],
    benefit:
      "Lower interest rates (typically 2–4% in USD terms vs 8–12% rupee credit). Natural hedge against currency risk if inputs imported in foreign currency.",
    howToClaim:
      "Apply to your bank with export order/LC. Bank sanctions PCFC against firm order.",
    applyAt: "Your AD Category 1 bank.",
    link: "https://rbi.org.in",
    sectors: ["textiles", "engineering", "gems", "pharma"],
  },
  {
    id: "ecgc",
    name: "ECGC Export Credit Guarantee",
    shortName: "ECGC",
    category: "financial",
    summary:
      "Export credit insurance protecting exporters and banks against risk of non-payment by overseas buyers (commercial and political risk). Makes it safer to offer credit terms to new buyers.",
    eligibility: [
      "Any Indian exporter",
      "Products not on restricted list",
      "Specific policies for short-term (up to 180 days) and medium-term",
    ],
    benefit:
      "Coverage up to 90% of loss due to buyer default or political risk. Enables offering open account / DA terms to buyers in risky markets. Helps get export credit from banks at lower rates.",
    howToClaim:
      "Take Shipments Comprehensive Risk (SCR) policy from ECGC. Declare shipments against policy. File claim within specified time if buyer defaults.",
    applyAt: "ECGC Limited — ecgc.in (offices in all major cities).",
    link: "https://ecgc.in",
    sectors: ["textiles", "engineering", "pharma", "leather", "spices", "gems"],
  },
];
