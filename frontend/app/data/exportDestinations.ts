export type ExportDestination = {
  code: string;
  name: string;
  flag: string;
  ftaWithIndia?: string;
  keyRegulators: string[];
  notes: string;
};

export const TOP_EXPORT_DESTINATIONS: ExportDestination[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    keyRegulators: ["FDA", "USDA", "CBP"],
    notes: "FDA registration required for food/pharma. CBP entry for goods >$800. No FTA with India.",
  },
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    ftaWithIndia: "India-UAE CEPA",
    keyRegulators: ["Dubai Customs", "ESMA"],
    notes: "CEPA preferential duty. Halal cert required for food. ESMA for consumer goods.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    keyRegulators: ["HMRC", "DEFRA"],
    notes: "Post-Brexit UK REACH for chemicals. UKCA mark replacing CE for some goods.",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    keyRegulators: ["German Customs", "BfR"],
    notes: "EU customs union. CE marking for regulated products. REACH compliance.",
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    keyRegulators: ["Dutch Customs", "NVWA"],
    notes: "Major EU gateway port (Rotterdam). EU import rules apply.",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    ftaWithIndia: "India-ASEAN",
    keyRegulators: ["Singapore Customs", "AVA"],
    notes: "ASEAN FTA. Free port with low tariffs. Strong re-export hub for SE Asia.",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    ftaWithIndia: "India-Australia ECTA",
    keyRegulators: ["ABF", "DAFF"],
    notes: "ECTA preferential duty. Strict biosecurity rules for food and agri products.",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    ftaWithIndia: "India-Japan CEPA",
    keyRegulators: ["Japan Customs", "MHLW"],
    notes: "CEPA preferential rates. MHLW approval for food/pharma. High quality standards.",
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    keyRegulators: ["GACC", "China Customs"],
    notes: "GACC registration for food exporters. No FTA with India currently.",
  },
  {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    ftaWithIndia: "SAFTA",
    keyRegulators: ["NBR"],
    notes: "SAFTA preferential duty. Land border trade (Petrapole, Benapole). Strong demand for cotton, machinery.",
  },
  {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    ftaWithIndia: "SAFTA",
    keyRegulators: ["Nepal Customs"],
    notes: "SAFTA. Open border with India. Zero duty on most Indian goods.",
  },
  {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    ftaWithIndia: "SAFTA",
    keyRegulators: ["Sri Lanka Customs"],
    notes: "SAFTA + India-Sri Lanka bilateral FTA. Sea route via Chennai/Tuticorin.",
  },
  {
    code: "KR",
    name: "South Korea",
    flag: "🇰🇷",
    ftaWithIndia: "India-Korea CEPA",
    keyRegulators: ["Korea Customs"],
    notes: "CEPA preferential rates. Strong demand for pharma, chemicals, textiles.",
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    ftaWithIndia: "India-ASEAN",
    keyRegulators: ["Royal Malaysia Customs", "MITI"],
    notes: "ASEAN FTA. Halal certification important for food exports.",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    keyRegulators: ["GAZT", "SFDA"],
    notes: "GCC market. Halal cert mandatory for food. SFDA for food/pharma. No FTA.",
  },
  {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    keyRegulators: ["Qatar Customs", "MOPH"],
    notes: "GCC market. Halal cert for food. Strong demand for food and construction materials.",
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    keyRegulators: ["SARS", "DAFF"],
    notes: "SACU gateway. DAFF phytosanitary for agri. Growing demand for pharma and engineering goods.",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    keyRegulators: ["CBSA", "Health Canada"],
    notes: "No FTA with India. CBSA entry requirements. Health Canada for food/pharma.",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    keyRegulators: ["French Customs", "DGCCRF"],
    notes: "EU customs union. CE marking for regulated products. Strong market for textiles and gems.",
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    keyRegulators: ["Italian Customs", "MISE"],
    notes: "EU customs union. Strong demand for textiles, leather, gems. CE marking required.",
  },
];

export const FTA_DESTINATION_CODES = TOP_EXPORT_DESTINATIONS
  .filter((d) => d.ftaWithIndia)
  .map((d) => d.code);
