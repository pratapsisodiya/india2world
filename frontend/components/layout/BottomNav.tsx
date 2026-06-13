"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  Wand2,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MobileNav } from "@/components/layout/MobileNav";

const tabs = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/readiness", label: "Readiness", icon: Target },
  { href: "/dashboard/schemes/wizard", label: "Schemes", icon: Wand2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <nav aria-label="Mobile navigation" className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => {
            const active =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                  active
                    ? "text-saffron-600 dark:text-saffron-400"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-zinc-400 transition-colors dark:text-zinc-500"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      </div>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
