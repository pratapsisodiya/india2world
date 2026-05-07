"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  chat: "AI Chat",
  research: "Research Agent",
  updates: "News Feed",
  readiness: "Readiness Score",
  schemes: "Schemes",
  wizard: "Scheme Finder",
  checklist: "Doc Checklist",
  fta: "FTA Advantage",
  compare: "Market Comparison",
  pricing: "Pricing Calculator",
  countries: "Country Profiles",
  saved: "Saved Items",
  glossary: "Glossary",
  "hs-codes": "HS Codes",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Skip breadcrumbs on root dashboard
  if (pathname === "/dashboard" || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let accumulated = "";
  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = SEGMENT_LABELS[seg] ?? seg.replace(/-/g, " ");
    crumbs.push({ label, href: accumulated });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-4 py-2 text-xs text-zinc-500 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm sm:px-6"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        aria-label="Dashboard home"
      >
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="capitalize transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
