"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Landmark,
  Hash,
  Settings,
  Target,
  FileText,
  Globe2,
  Wand2,
  ShieldAlert,
  User,
  ChevronDown,
  Scale,
  DollarSign,
  Bookmark,
  Sparkles,
  Newspaper,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Users,
  CalendarDays,
  Banknote,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";
import { useChatStore } from "@/store/chat";
import { useActivityStore } from "@/store/activity";
import { Badge } from "@/components/ui/Badge";

const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  registered: "Registered",
  "first-shipment": "First Shipment",
  scaling: "Scaling",
};
const STAGE_NEXT: Record<string, string> = {
  planning: "→ Get Registered",
  registered: "→ First Shipment",
  "first-shipment": "→ Scale Up",
};

const ACTIVITY_ICONS: Record<string, typeof Clock> = {
  chat: MessageSquare,
  readiness: Target,
  checklist: FileText,
  fta: Globe2,
  "scheme-wizard": Wand2,
  "scheme-browse": Landmark,
  "hs-lookup": Hash,
  glossary: BookOpen,
  compare: Scale,
  pricing: DollarSign,
  countries: Globe2,
  saved: Bookmark,
  research: Sparkles,
  updates: Newspaper,
};

const sidebarGroups = [
  {
    label: "AI Tools",
    // split into logical subcategories for easier open/close
    subgroups: [
      {
        label: "Core",
        links: [
          { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
          { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
          { href: "/dashboard/research", label: "Research Agent", icon: Sparkles },
          { href: "/dashboard/updates", label: "News Feed", icon: Newspaper },
        ],
      },
      {
        label: "Assessment",
        links: [
          { href: "/dashboard/readiness", label: "Readiness Score", icon: Target },
          { href: "/dashboard/schemes/wizard", label: "Find My Schemes", icon: Wand2 },
          { href: "/dashboard/buyers", label: "Buyer Finder", icon: Users },
          { href: "/dashboard/screening", label: "Party Screening", icon: ShieldAlert },
          { href: "/dashboard/documents", label: "Doc Generator", icon: FileText },
          { href: "/dashboard/events", label: "Trade Events", icon: CalendarDays },
        ],
      },
      {
        label: "Tools & Calculators",
        links: [
          { href: "/dashboard/checklist", label: "Export Checklist", icon: FileText },
          { href: "/dashboard/fta", label: "FTA Advantage", icon: Globe2 },
          { href: "/dashboard/compare", label: "Market Comparison", icon: Scale },
          { href: "/dashboard/pricing", label: "Pricing Calculator", icon: DollarSign },
          { href: "/dashboard/currency", label: "Currency Converter", icon: Banknote },
        ],
      },
    ],
  },
  {
    label: "Reference",
    links: [
      { href: "/dashboard/schemes", label: "Schemes", icon: Landmark },
      { href: "/dashboard/glossary", label: "Glossary", icon: BookOpen },
      { href: "/dashboard/hs-codes", label: "HS Codes", icon: Hash },
      { href: "/dashboard/countries", label: "Country Profiles", icon: Globe2 },
      { href: "/dashboard/saved", label: "Saved Items", icon: Bookmark },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const STORAGE_KEY = "india2world-sidebar-collapsed";

function loadCollapsed(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function Sidebar() {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const profile = useUserStore((s) => s.profile);
  const chatMessages = useChatStore((s) => s.messages);
  const chatThreads = useChatStore((s) => s.threads);
  const lastSeenTs = useChatStore((s) => s.lastSeenTs);
  const recentActivity = useActivityStore((s) => s.entries);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => loadCollapsed());

  const unreadChatCount = chatMessages.filter(
    (m) => m.role === "assistant" && m.ts > lastSeenTs
  ).length;

  const completedMilestones = useActivityStore((s) =>
    s.milestones.filter((m) => m.completedAt).length
  );
  const totalMilestones = useActivityStore((s) => s.milestones.length);

  // Last 3 non-chat activity entries for quick resume
  const recentNonChat = recentActivity
    .filter((e) => e.kind !== "chat")
    .slice(0, 3);

  function toggleGroup(label: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const displayName = profile.businessName || clerkUser?.fullName || clerkUser?.username || null;
  const initials = displayName
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : null;

  const nextStageLabel = profile.exportStage ? STAGE_NEXT[profile.exportStage] : null;

  // Compute readiness color
  const score = profile.readinessScore;
  const scoreColor =
    score == null ? "" :
    score >= 75 ? "bg-india-green-500" :
    score >= 40 ? "bg-saffron-500" :
    "bg-red-500";

  return (
    <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto sidebar-scroll">
      <div className="flex flex-col p-3 gap-3">

        {/* ── Profile card ─────────────────────────────────────────────── */}
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/80 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
          {clerkUser ? (
            <>
              <div className="flex items-center gap-2.5">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {displayName ?? clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {profile.sector && (
                      <Badge variant="orange">{profile.sector}</Badge>
                    )}
                    {profile.exportStage && (
                      <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                        {STAGE_LABELS[profile.exportStage]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Readiness score bar */}
              {typeof score === "number" && (
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                      Export readiness
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold",
                      score >= 75 ? "text-india-green-600 dark:text-india-green-400" :
                      score >= 40 ? "text-saffron-600 dark:text-saffron-400" :
                      "text-red-500 dark:text-red-400"
                    )}>
                      {score}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", scoreColor)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Export stage + next step */}
              {nextStageLabel && (
                <Link
                  href="/dashboard/readiness"
                  className="mt-2 flex items-center gap-1 text-[10px] text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 transition-colors"
                >
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  {nextStageLabel}
                </Link>
              )}

              {/* Milestones mini progress */}
              {completedMilestones > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-3 w-3 text-india-green-500 shrink-0" />
                  {completedMilestones}/{totalMilestones} milestones
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 text-sm font-medium text-zinc-500 transition-colors hover:text-saffron-600 dark:text-zinc-400 dark:hover:text-saffron-400"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Sign in</p>
                <p className="text-[10px] text-zinc-400">To save your progress</p>
              </div>
            </Link>
          )}
        </div>

        {/* ── Recent activity quick-resume ──────────────────────────── */}
        {(recentNonChat.length > 0 || chatThreads.length > 0) && (
          <div>
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Recent
            </p>
            <div className="flex flex-col gap-0.5">
              {recentNonChat.map((entry) => {
                const Icon = ACTIVITY_ICONS[entry.kind] ?? Clock;
                return (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Icon className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                    <span className="flex-1 truncate">{entry.label}</span>
                    <span className="shrink-0 text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {relativeTime(entry.ts)}
                    </span>
                  </Link>
                );
              })}
              {chatThreads.slice(0, 2).map((thread) => (
                <Link
                  key={thread.id}
                  href="/dashboard/chat"
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200 transition-colors"
                >
                  <MessageSquare className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="flex-1 truncate">{thread.title}</span>
                  <span className="shrink-0 text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {relativeTime(thread.updatedAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Grouped navigation ───────────────────────────────────── */}
        <nav className="flex flex-col">
          {sidebarGroups.map((group, gi) => {
            const isCollapsed = collapsed[group.label] ?? false;
            return (
              <div key={group.label} className={cn(gi > 0 && "mt-3")}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="mb-1 flex w-full items-center justify-between px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>
                {!isCollapsed && (
                  <div className="flex flex-col gap-0.5">
                    {group.subgroups ? (
                      group.subgroups.map((sub) => {
                        const subKey = `${group.label}::${sub.label}`;
                        const subCollapsed = collapsed[subKey] ?? false;
                        return (
                          <div key={sub.label} className={cn("pl-1", "pb-1")}> 
                            <button
                              type="button"
                              onClick={() => toggleGroup(subKey)}
                              className="mb-1 flex w-full items-center justify-between px-2.5 text-[11px] font-semibold tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                            >
                              {sub.label}
                              <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", subCollapsed && "-rotate-90")} />
                            </button>
                            {!subCollapsed && (
                              <div className="flex flex-col gap-0.5">
                                {sub.links.map((link) => {
                                  const active =
                                    link.href === "/dashboard"
                                      ? pathname === "/dashboard"
                                      : link.href === "/dashboard/schemes"
                                      ? pathname === "/dashboard/schemes"
                                      : pathname.startsWith(link.href);
                                  const Icon = link.icon;
                                  return (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      className={cn(
                                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                                        active
                                          ? "bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                                      )}
                                    >
                                      <Icon className="h-4 w-4 shrink-0" />
                                      <span className="flex-1">{link.label}</span>
                                      {link.href === "/dashboard/chat" && unreadChatCount > 0 && !active && (
                                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">
                                          {unreadChatCount}
                                        </span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      group.links.map((link) => {
                        const active =
                          link.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : link.href === "/dashboard/schemes"
                            ? pathname === "/dashboard/schemes"
                            : pathname.startsWith(link.href);
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                              active
                                ? "bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{link.label}</span>
                            {link.href === "/dashboard/chat" && unreadChatCount > 0 && !active && (
                              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">
                                {unreadChatCount}
                              </span>
                            )}
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Quick new chat CTA ────────────────────────────────────── */}
        <Link
          href="/dashboard/chat"
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-saffron-500/10 border border-saffron-200/50 dark:border-saffron-500/20 px-3 py-2.5 text-xs font-semibold text-saffron-700 dark:text-saffron-400 hover:bg-saffron-500/15 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          New AI Chat
          <ArrowRight className="h-3 w-3 ml-auto" />
        </Link>

      </div>
    </aside>
  );
}
