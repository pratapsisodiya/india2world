"use client";

import Link from "next/link";
import { ArrowRight, Landmark, Hash, MessageSquare } from "lucide-react";
import { useUserStore } from "@/store/user";

interface SectorInfo {
  hsChapters: string;
  keySchemes: string[];
  topMarkets: string[];
  tip: string;
}

const SECTOR_INSIGHTS: Record<string, SectorInfo> = {
  "Textiles & apparel": {
    hsChapters: "50-63",
    keySchemes: ["RoSCTL", "RoDTEP", "EPCG"],
    topMarkets: ["USA", "UAE", "UK"],
    tip: "Apparel exporters can claim RoSCTL scrips on top of RoDTEP — check both.",
  },
  "Handicrafts": {
    hsChapters: "44, 57, 69, 94, 97",
    keySchemes: ["MAI", "RoDTEP", "EPCG"],
    topMarkets: ["USA", "UK", "Germany"],
    tip: "EPCH membership unlocks subsidized trade fair participation under MAI.",
  },
  "Spices & agri": {
    hsChapters: "07-10, 09",
    keySchemes: ["RoDTEP", "TMA", "Advance Authorisation"],
    topMarkets: ["USA", "UAE", "China"],
    tip: "FSSAI + Spices Board registration are mandatory — start these early.",
  },
  "Gems & jewellery": {
    hsChapters: "71",
    keySchemes: ["RoDTEP", "Star Export House", "Advance Authorisation"],
    topMarkets: ["UAE", "USA", "Hong Kong"],
    tip: "Kimberley Process Certificate is mandatory for rough diamond exports.",
  },
  "Engineering goods": {
    hsChapters: "72-73, 84-85",
    keySchemes: ["RoDTEP", "EPCG", "Interest Equalisation"],
    topMarkets: ["USA", "UAE", "Germany"],
    tip: "CE marking is required for EU markets — factor 3-6 months for certification.",
  },
  "Pharma & life sciences": {
    hsChapters: "30",
    keySchemes: ["RoDTEP", "Interest Equalisation", "EPCG"],
    topMarkets: ["USA", "UK", "South Africa"],
    tip: "WHO-GMP certification opens regulated markets — prioritize this early.",
  },
  "IT & ITES services": {
    hsChapters: "N/A (services)",
    keySchemes: ["SEIS", "Interest Equalisation"],
    topMarkets: ["USA", "UK", "Singapore"],
    tip: "SEIS provides 5% duty credit scrips on net foreign exchange earned.",
  },
  "Leather & footwear": {
    hsChapters: "41-42, 64",
    keySchemes: ["RoDTEP", "EPCG", "Interest Equalisation"],
    topMarkets: ["USA", "UK", "Germany"],
    tip: "CLE membership is required for RCMC — apply via DGFT.",
  },
};

export function SectorInsight() {
  const sector = useUserStore((s) => s.profile.sector);

  if (!sector) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Set your business sector in{" "}
          <Link href="/settings" className="text-saffron-600 underline dark:text-saffron-400">
            Settings
          </Link>{" "}
          to unlock targeted insights.
        </p>
      </div>
    );
  }

  const info = SECTOR_INSIGHTS[sector];
  if (!info) return null;

  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        For {sector} exporters
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {info.tip}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Hash className="h-3.5 w-3.5" />
            HS Chapters
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {info.hsChapters}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Landmark className="h-3.5 w-3.5" />
            Key Schemes
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {info.keySchemes.join(", ")}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <MessageSquare className="h-3.5 w-3.5" />
            Top Markets
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {info.topMarkets.join(", ")}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/chat?q=I export ${sector.toLowerCase()} from India. What schemes, certifications, and markets should I focus on?`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-saffron-600 transition-colors hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300"
      >
        Get AI guidance for your sector
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
