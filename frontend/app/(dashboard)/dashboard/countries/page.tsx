"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Globe2, ExternalLink, Calculator, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";

type FtaStatus = "active" | "negotiating" | "none";
type FilterValue = "all" | FtaStatus;

interface Country {
  name: string;
  flag: string;
  code: string;
  region: string;
  ftaStatus: FtaStatus;
  ftaName?: string;
  topExports: string[];
  tariffRange: string;
  currency: string;
  paymentTerms: string;
  keyNote: string;
}

const COUNTRIES: Country[] = [
  {
    name: "United States",
    flag: "🇺🇸",
    code: "USA",
    region: "Americas",
    ftaStatus: "none",
    topExports: ["Gems & Jewellery", "Pharmaceuticals", "Textiles", "Machinery", "Chemicals"],
    tariffRange: "0–32% (avg. 3.4%)",
    currency: "USD",
    paymentTerms: "LC, Open Account, DA/DP",
    keyNote: "India's largest export market. No bilateral FTA — India-US TTA negotiations ongoing. GSP benefits lapsed 2019.",
  },
  {
    name: "United Arab Emirates",
    flag: "🇦🇪",
    code: "UAE",
    region: "Middle East",
    ftaStatus: "active",
    ftaName: "India-UAE CEPA (2022)",
    topExports: ["Gems & Jewellery", "Petroleum products", "Apparel", "Machinery", "Spices"],
    tariffRange: "0–5% (CEPA: 0% on most goods)",
    currency: "AED",
    paymentTerms: "LC at sight, TT, DA 30–60 days",
    keyNote: "Zero-duty on most Indian goods under CEPA. Major re-export hub to GCC and Africa. Large Indian diaspora.",
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    code: "UK",
    region: "Europe",
    ftaStatus: "negotiating",
    ftaName: "India-UK FTA (under negotiation)",
    topExports: ["Refined Petroleum", "Pharma", "Apparel", "Engineering Goods", "Gems"],
    tariffRange: "0–12% (post-Brexit UK global tariff)",
    currency: "GBP",
    paymentTerms: "Open Account, LC, DA 60–90 days",
    keyNote: "Post-Brexit UK has its own tariff schedule. FTA under negotiation — expected duty cuts on textiles and food.",
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    code: "DEU",
    region: "Europe",
    ftaStatus: "none",
    topExports: ["Engineering Goods", "Chemicals", "Pharma", "Textiles", "Leather"],
    tariffRange: "0–12% (EU MFN rates)",
    currency: "EUR",
    paymentTerms: "Open Account, Bank Guarantee",
    keyNote: "EU's largest economy. No India-EU FTA yet — negotiations resumed 2022. CE marking required for most products.",
  },
  {
    name: "Netherlands",
    flag: "🇳🇱",
    code: "NLD",
    region: "Europe",
    ftaStatus: "none",
    topExports: ["Petroleum Products", "Gems", "Chemicals", "Machinery", "Textiles"],
    tariffRange: "0–12% (EU MFN rates)",
    currency: "EUR",
    paymentTerms: "Open Account, LC",
    keyNote: "Rotterdam is Europe's largest port — major entry point for Indian goods to EU. Same EU tariff regime as Germany.",
  },
  {
    name: "Singapore",
    flag: "🇸🇬",
    code: "SGP",
    region: "Asia-Pacific",
    ftaStatus: "active",
    ftaName: "India-Singapore CECA (2005)",
    topExports: ["Petroleum", "Gems", "Machinery", "Pharmaceuticals", "Electronics"],
    tariffRange: "0% (most goods duty-free)",
    currency: "SGD",
    paymentTerms: "TT, Open Account, LC",
    keyNote: "CECA grants preferential tariffs. Regional financial and logistics hub with easy re-export to ASEAN.",
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    code: "JPN",
    region: "Asia-Pacific",
    ftaStatus: "active",
    ftaName: "India-Japan CEPA (2011)",
    topExports: ["Petroleum", "Minerals", "Pharma", "Chemicals", "Engineering"],
    tariffRange: "0–20% (CEPA: reduced on textiles, seafood, chemicals)",
    currency: "JPY",
    paymentTerms: "LC at sight, DA/DP, Open Account",
    keyNote: "Quality-sensitive market. CEPA reduces duties on ~90% of traded goods. JIS and Japanese food standards apply.",
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    code: "AUS",
    region: "Asia-Pacific",
    ftaStatus: "active",
    ftaName: "India-Australia ECTA (2022)",
    topExports: ["Pharma", "Textiles", "Engineering", "Chemicals", "Gems"],
    tariffRange: "0–5% (ECTA: zero-duty on 85% of Indian exports)",
    currency: "AUD",
    paymentTerms: "LC, TT, Open Account",
    keyNote: "ECTA in force since Dec 2022. Pharma, textiles, and leather get immediate zero duty. Strong Indian diaspora.",
  },
  {
    name: "South Korea",
    flag: "🇰🇷",
    code: "KOR",
    region: "Asia-Pacific",
    ftaStatus: "active",
    ftaName: "India-Korea CEPA (2010)",
    topExports: ["Mineral Fuels", "Cotton Yarn", "Chemicals", "Pharma", "Machinery"],
    tariffRange: "0–8% (CEPA reduced on 85% of goods)",
    currency: "KRW",
    paymentTerms: "LC, DA/DP, Open Account",
    keyNote: "Strong demand for Indian textile yarns, chemicals, and generic pharma. Electronics and auto parts compete.",
  },
  {
    name: "Bangladesh",
    flag: "🇧🇩",
    code: "BGD",
    region: "South Asia",
    ftaStatus: "active",
    ftaName: "SAFTA (South Asian FTA)",
    topExports: ["Cotton Yarn", "Machinery", "Iron & Steel", "Vehicles", "Chemicals"],
    tariffRange: "0–3% under SAFTA",
    currency: "BDT",
    paymentTerms: "LC, TT, DP",
    keyNote: "India's largest South Asian export market. Land route via Petrapole-Benapole. Major buyer of Indian cotton.",
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    code: "SAU",
    region: "Middle East",
    ftaStatus: "none",
    topExports: ["Petroleum Products", "Rice", "Machinery", "Chemicals", "Pharma"],
    tariffRange: "5–15% (GCC common external tariff)",
    currency: "SAR",
    paymentTerms: "LC, TT",
    keyNote: "GCC-India FTA negotiations ongoing. Halal certification required for food products. Large Indian expatriate community.",
  },
  {
    name: "China",
    flag: "🇨🇳",
    code: "CHN",
    region: "Asia-Pacific",
    ftaStatus: "none",
    topExports: ["Cotton Yarn", "Organic Chemicals", "Seafood", "Minerals", "Pharma APIs"],
    tariffRange: "0–25% (MFN; anti-dumping duties on some goods)",
    currency: "CNY",
    paymentTerms: "TT, LC",
    keyNote: "India's largest trading partner but trade deficit is high. Anti-dumping duties on some Indian exports. Quality bars are high.",
  },
  {
    name: "France",
    flag: "🇫🇷",
    code: "FRA",
    region: "Europe",
    ftaStatus: "none",
    topExports: ["Pharma", "Gems", "Leather", "Textiles", "Chemicals"],
    tariffRange: "0–12% (EU MFN rates)",
    currency: "EUR",
    paymentTerms: "Open Account, LC",
    keyNote: "Strong market for Indian luxury leather, gems, and spices. EU food safety (RASFF) standards strictly enforced.",
  },
  {
    name: "Belgium",
    flag: "🇧🇪",
    code: "BEL",
    region: "Europe",
    ftaStatus: "none",
    topExports: ["Gems & Diamonds", "Chemicals", "Pharma", "Machinery"],
    tariffRange: "0–12% (EU MFN rates)",
    currency: "EUR",
    paymentTerms: "Open Account, LC",
    keyNote: "Antwerp is the world's diamond capital — critical market for Indian gem exports. Port of entry for EU goods.",
  },
  {
    name: "Malaysia",
    flag: "🇲🇾",
    code: "MYS",
    region: "Asia-Pacific",
    ftaStatus: "none",
    topExports: ["Mineral Fuels", "Machinery", "Cotton", "Chemicals", "Pharma"],
    tariffRange: "0–30% (MFN rates)",
    currency: "MYR",
    paymentTerms: "LC, TT, DA/DP",
    keyNote: "No bilateral FTA. Halal certification is a strong market advantage for food products. ASEAN gateway.",
  },
  {
    name: "South Africa",
    flag: "🇿🇦",
    code: "ZAF",
    region: "Africa",
    ftaStatus: "none",
    topExports: ["Pharma", "Machinery", "Vehicles", "Chemicals", "Textiles"],
    tariffRange: "0–45% (SACU tariffs)",
    currency: "ZAR",
    paymentTerms: "LC, TT",
    keyNote: "Gateway to Sub-Saharan Africa. Strong demand for Indian generics and auto components. Port of Durban is key.",
  },
  {
    name: "Brazil",
    flag: "🇧🇷",
    code: "BRA",
    region: "Americas",
    ftaStatus: "none",
    topExports: ["Chemicals", "Pharma", "Machinery", "Textiles", "Fertilisers"],
    tariffRange: "10–35% (Mercosur common tariff)",
    currency: "BRL",
    paymentTerms: "LC, TT",
    keyNote: "High tariff market but large economy. Pharma and chemicals see strong demand. India-Mercosur PTA exists but limited.",
  },
  {
    name: "Vietnam",
    flag: "🇻🇳",
    code: "VNM",
    region: "Asia-Pacific",
    ftaStatus: "none",
    topExports: ["Cotton", "Machinery", "Iron & Steel", "Chemicals", "Pharma"],
    tariffRange: "0–35% (MFN)",
    currency: "VND",
    paymentTerms: "LC, TT, DA/DP",
    keyNote: "Fast-growing manufacturing hub. India exports raw materials (cotton, steel) consumed in Vietnam's export factories.",
  },
  {
    name: "Nepal",
    flag: "🇳🇵",
    code: "NPL",
    region: "South Asia",
    ftaStatus: "active",
    ftaName: "India-Nepal Treaty of Trade",
    topExports: ["Petroleum", "Agricultural products", "FMCG", "Machinery", "Vehicles"],
    tariffRange: "0–5% (preferential rates under treaty)",
    currency: "NPR",
    paymentTerms: "TT, DP",
    keyNote: "Open border with India. Nepal is heavily dependent on Indian exports. Land trade through major border checkpoints.",
  },
];

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Countries" },
  { value: "active", label: "FTA Active" },
  { value: "negotiating", label: "Negotiating" },
  { value: "none", label: "No FTA" },
];

const FTA_BADGE: Record<FtaStatus, { label: string; variant: "green" | "amber" | "default" }> = {
  active: { label: "FTA Active", variant: "green" },
  negotiating: { label: "Negotiating", variant: "amber" },
  none: { label: "No FTA", variant: "default" },
};

export default function CountriesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const handleSearch = useCallback((v: string) => setSearch(v), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COUNTRIES.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.topExports.some((e) => e.toLowerCase().includes(q)) ||
        c.region.toLowerCase().includes(q);
      const matchFilter = filter === "all" || c.ftaStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="h-5 w-5 text-saffron-500" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Country Profiles
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Key export market data for India's top 20 trading partners — FTA status, tariffs, and payment norms.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search country or product category..."
            />
          </div>
          <FilterTabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />
        </div>

        {/* Summary */}
        <p className="text-xs text-zinc-400 mb-4">
          Showing {filtered.length} of {COUNTRIES.length} markets
        </p>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Globe2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No countries match your search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((country) => {
              const badge = FTA_BADGE[country.ftaStatus];
              return (
                <div
                  key={country.code}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                          {country.name}
                        </p>
                        <p className="text-xs text-zinc-400">{country.region} · {country.currency}</p>
                      </div>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  {/* FTA name if active */}
                  {country.ftaName && (
                    <div className="px-3 py-2 rounded-lg bg-india-green-50 dark:bg-india-green-500/10 border border-india-green-200 dark:border-india-green-500/20">
                      <p className="text-xs font-medium text-india-green-700 dark:text-india-green-400">
                        {country.ftaName}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-400 mb-0.5 font-medium">Tariff range</p>
                      <p className="text-zinc-700 dark:text-zinc-300">{country.tariffRange}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 mb-0.5 font-medium">Payment terms</p>
                      <p className="text-zinc-700 dark:text-zinc-300">{country.paymentTerms}</p>
                    </div>
                  </div>

                  {/* Top exports */}
                  <div>
                    <p className="text-xs text-zinc-400 font-medium mb-1.5">India's top exports</p>
                    <div className="flex flex-wrap gap-1">
                      {country.topExports.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key note */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    {country.keyNote}
                  </p>

                  {/* CTAs */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/dashboard/chat?q=How can I export ${country.topExports[0].toLowerCase()} to ${country.name} from India?`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-400 text-xs font-semibold hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors border border-saffron-200 dark:border-saffron-800/40"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Ask AI
                    </Link>
                    {country.ftaStatus === "active" && (
                      <Link
                        href="/dashboard/fta"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-india-green-50 dark:bg-india-green-900/20 text-india-green-700 dark:text-india-green-400 text-xs font-semibold hover:bg-india-green-100 dark:hover:bg-india-green-900/30 transition-colors border border-india-green-200 dark:border-india-green-800/40"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        FTA Savings
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/compare`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Compare with another market"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
