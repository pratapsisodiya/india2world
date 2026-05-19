"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Menu, ChevronDown, LayoutDashboard, Settings, LogOut, User,
  MessageSquare, Target, Wand2, FileText, Globe2, BookOpen, Landmark,
  Hash, ExternalLink, ArrowRight, Search, Bookmark, Clock, Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";
import { useActivityStore } from "@/store/activity";
import { useSavedStore } from "@/store/saved";
import { useClerk } from "@clerk/nextjs";

const toolsLinks = [
  { href: "/dashboard/chat",            label: "AI Chat",          description: "Ask our export AI agent anything",          icon: MessageSquare, color: "text-orange-500",  iconBg: "bg-orange-50 dark:bg-orange-900/20" },
  { href: "/dashboard/readiness",       label: "Readiness Score",  description: "6-question export readiness assessment",     icon: Target,        color: "text-saffron-500", iconBg: "bg-amber-50 dark:bg-amber-900/20" },
  { href: "/dashboard/schemes/wizard",  label: "Find My Schemes",  description: "Match schemes to your business profile",     icon: Wand2,         color: "text-green-500",   iconBg: "bg-green-50 dark:bg-green-900/20" },
  { href: "/dashboard/checklist",       label: "Doc Checklist",    description: "Tailored document list by product & market", icon: FileText,      color: "text-blue-500",    iconBg: "bg-blue-50 dark:bg-blue-900/20" },
  { href: "/dashboard/fta",             label: "FTA Advantage",    description: "Calculate FTA tariff savings",               icon: Globe2,        color: "text-purple-500",  iconBg: "bg-purple-50 dark:bg-purple-900/20" },
  { href: "/dashboard/schemes",         label: "Gov. Schemes",     description: "RoDTEP, EPCG, Duty Drawback & more",        icon: Landmark,      color: "text-green-600",   iconBg: "bg-green-50 dark:bg-green-900/20" },
  { href: "/dashboard/glossary",        label: "Glossary",         description: "60+ export terms defined",                  icon: BookOpen,      color: "text-blue-600",    iconBg: "bg-blue-50 dark:bg-blue-900/20" },
  { href: "/dashboard/hs-codes",        label: "HS Code Lookup",   description: "Find the right ITC-HS classification",      icon: Hash,          color: "text-purple-600",  iconBg: "bg-purple-50 dark:bg-purple-900/20" },
];

const resourceLinks = [
  { href: "https://dgft.gov.in",        label: "DGFT",    description: "Directorate General of Foreign Trade" },
  { href: "https://www.icegate.gov.in", label: "ICEGATE", description: "Customs e-Commerce gateway" },
  { href: "https://apeda.gov.in",       label: "APEDA",   description: "Agri & processed food export authority" },
  { href: "https://www.fieo.org",       label: "FIEO",    description: "Federation of Indian Export Organisations" },
];

const KIND_LABELS: Record<string, string> = {
  chat: "AI Chat",
  readiness: "Readiness",
  checklist: "Checklist",
  fta: "FTA",
  "scheme-wizard": "Schemes",
  "scheme-browse": "Schemes",
  "hs-lookup": "HS Codes",
  glossary: "Glossary",
  compare: "Compare",
  pricing: "Pricing",
  countries: "Countries",
  saved: "Saved",
  research: "Research",
  updates: "News",
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return { open, setOpen, ref };
}

function ToolsDropdown({ active }: { active?: boolean }) {
  const { open, setOpen, ref } = useDropdown();
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active || open
            ? "bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        )}
      >
        Tools
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-130 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          <div className="mb-2 flex items-center justify-between px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Export Tools</span>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xs font-medium text-saffron-600 hover:text-saffron-700 dark:text-saffron-400">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            {toolsLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <div className={cn("mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg", link.iconBg)}>
                    <Icon className={cn("h-3.5 w-3.5", link.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{link.label}</p>
                    <p className="text-xs leading-4 text-zinc-500 dark:text-zinc-400">{link.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesDropdown() {
  const { open, setOpen, ref } = useDropdown();
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          open
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        )}
      >
        Resources
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-zinc-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          <div className="mb-1 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Government Portals</span>
          </div>
          {resourceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
            >
              <div className="flex items-start gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-india-green-500 shrink-0 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{link.label}</p>
                  <p className="text-xs text-zinc-500">{link.description}</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityDropdown() {
  const { open, setOpen, ref } = useDropdown();
  const entries = useActivityStore((s) => s.entries.slice(0, 6));

  if (entries.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Recent activity"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
          open
            ? "border-saffron-300 bg-saffron-50 text-saffron-600 dark:border-saffron-700 dark:bg-saffron-900/20 dark:text-saffron-400"
            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        )}
      >
        <Clock className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-zinc-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          <div className="mb-1 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Recent Activity</span>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xs font-medium text-saffron-600 dark:text-saffron-400">
              Dashboard →
            </Link>
          </div>
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={entry.href}
              onClick={() => setOpen(false)}
              className="flex items-start justify-between rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {KIND_LABELS[entry.kind] ?? entry.kind}
                </span>
                <p className="line-clamp-1 text-sm text-zinc-700 dark:text-zinc-300">{entry.label}</p>
              </div>
              <span className="ml-2 shrink-0 text-[10px] text-zinc-400">{relativeTime(entry.ts)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedDropdown() {
  const { open, setOpen, ref } = useDropdown();
  const items = useSavedStore((s) => s.items.slice(0, 5));
  const savedSchemes = useUserStore((s) => s.profile.savedSchemes);
  const savedGlossary = useUserStore((s) => s.profile.savedGlossaryTerms);
  const total = items.length + savedSchemes.length + savedGlossary.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Saved items"
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
          open
            ? "border-saffron-300 bg-saffron-50 text-saffron-600 dark:border-saffron-700 dark:bg-saffron-900/20 dark:text-saffron-400"
            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        )}
      >
        <Bookmark className="h-3.5 w-3.5" />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-saffron-500 px-0.5 text-[8px] font-bold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-zinc-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          <div className="mb-1 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Saved Items</span>
            <Link href="/dashboard/saved" onClick={() => setOpen(false)} className="text-xs font-medium text-saffron-600 dark:text-saffron-400">
              View all →
            </Link>
          </div>
          {total === 0 ? (
            <p className="px-3 py-3 text-xs text-zinc-400">No saved items yet. Bookmark schemes, glossary terms, or chat answers.</p>
          ) : (
            <>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? "/dashboard/saved"}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                >
                  <span className="mt-0.5 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.type}
                  </span>
                  <p className="line-clamp-1 text-sm text-zinc-700 dark:text-zinc-300">{item.title}</p>
                </Link>
              ))}
              {savedSchemes.length > 0 && (
                <p className="px-3 py-1 text-[10px] text-zinc-400">
                  +{savedSchemes.length} saved scheme{savedSchemes.length !== 1 ? "s" : ""}
                </p>
              )}
              {savedGlossary.length > 0 && (
                <p className="px-3 py-1 text-[10px] text-zinc-400">
                  +{savedGlossary.length} glossary term{savedGlossary.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { profile, logout } = useUserStore();
  const router = useRouter();
  const { open, setOpen, ref } = useDropdown();

  const initials = profile.businessName
    ? profile.businessName.slice(0, 2).toUpperCase()
    : profile.email
    ? profile.email.slice(0, 2).toUpperCase()
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-saffron-400 to-india-green-500 text-xs font-bold text-white ring-2 ring-white transition-all hover:scale-105 hover:shadow-md dark:ring-zinc-900"
      >
        {initials ?? <User className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {profile.businessName || "My Account"}
            </p>
            <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
            {typeof profile.readinessScore === "number" && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-saffron-500"
                    style={{ width: `${profile.readinessScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-saffron-600 dark:text-saffron-400">
                  {profile.readinessScore}% ready
                </span>
              </div>
            )}
          </div>
          <Link href="/dashboard" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/dashboard/saved" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Bookmark className="h-4 w-4" /> Saved Items
          </Link>
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
          <UserMenuSignOut setOpen={setOpen} />
        </div>
        </div>
      )}
    </div>
  );
}

function UpdatesIndicator() {
  // Shows a pulse dot when there's an unread updates/news entry
  // This is intentionally lightweight — just a visual hint to check the news feed
  return (
    <Link
      href="/dashboard/updates"
      aria-label="Export news and updates"
      className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
    >
      <Bell className="h-3.5 w-3.5" />
      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-saffron-500" />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { profile } = useUserStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isDashboardActive = pathname.startsWith("/dashboard");
  const isToolsActive =
    pathname === "/dashboard/chat" ||
    pathname.startsWith("/dashboard/readiness") ||
    pathname.startsWith("/dashboard/schemes") ||
    pathname.startsWith("/dashboard/checklist") ||
    pathname.startsWith("/dashboard/fta") ||
    pathname.startsWith("/dashboard/glossary") ||
    pathname.startsWith("/dashboard/hs-codes");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-zinc-200/80 bg-white/92 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/92 shadow-[0_1px_0_0_rgba(255,153,51,0.15),0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_0_rgba(255,153,51,0.10),0_2px_8px_-2px_rgba(0,0,0,0.3)]"
            : "border-b border-transparent bg-white/70 backdrop-blur-md dark:bg-zinc-950/70"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="tricolor-gradient inline-block h-7 w-5.5 rounded-sm ring-1 ring-zinc-300 dark:ring-zinc-600 transition-transform group-hover:scale-105" />
            <span className="text-[15px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 transition-colors group-hover:text-saffron-600 dark:group-hover:text-saffron-400">
              India<span className="text-saffron-500">2</span>World
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={cn(
                "px-3 py-2 text-sm transition-colors",
                pathname === "/"
                  ? "font-semibold text-saffron-600 underline underline-offset-4 decoration-2 decoration-saffron-400/60 dark:text-saffron-400"
                  : "font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "px-3 py-2 text-sm transition-colors",
                isDashboardActive && !isToolsActive
                  ? "font-semibold text-saffron-600 underline underline-offset-4 decoration-2 decoration-saffron-400/60 dark:text-saffron-400"
                  : "font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              Dashboard
            </Link>
            <ToolsDropdown active={isToolsActive} />
            <ResourcesDropdown />
          </nav>

          <div className="hidden md:block h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Command search */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="Open command palette"
              className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:text-zinc-300 sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="ml-1 rounded border border-zinc-200 px-1 py-0.5 font-mono text-[10px] dark:border-zinc-700">⌘K</kbd>
            </button>

            <ThemeToggle />

            {profile.isLoggedIn ? (
              <>
                <UpdatesIndicator />
                <ActivityDropdown />
                <SavedDropdown />
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 sm:inline-flex"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="group hidden items-center gap-1.5 rounded-full bg-linear-to-r from-saffron-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.03] active:scale-[0.98] sm:inline-flex"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

function UserMenuSignOut({ setOpen }: { setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const logout = useUserStore((s) => s.logout);

  const handleSignOut = async () => {
    logout();
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  );
}
