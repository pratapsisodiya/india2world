"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Wand2,
  Menu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MobileNav } from "@/components/layout/MobileNav";
import { useChatStore } from "@/store/chat";

const tabs = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/research", label: "Research", icon: Sparkles },
  { href: "/dashboard/schemes/wizard", label: "Schemes", icon: Wand2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const unreadCount = useChatStore((s) =>
    s.messages.filter((m) => m.role === "assistant" && m.ts > s.lastSeenTs).length
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-lg items-center justify-around px-1 py-1"
        >
          {tabs.map((tab) => {
            const active =
              tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            const showBadge = tab.href === "/dashboard/chat" && unreadCount > 0 && !active;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all active:scale-95",
                  active
                    ? "text-saffron-600 dark:text-saffron-400"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                <motion.div
                  className="relative"
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-saffron-500 px-0.5 text-[8px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </motion.div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {/* Active indicator dot — animated */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="bottom-nav-dot"
                      className="absolute bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-saffron-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-zinc-400 transition-all active:scale-95 dark:text-zinc-500"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      </div>

      {/* Floating chat FAB — only on mobile, not on chat page */}
      {pathname !== "/dashboard/chat" && (
        <Link
          href="/dashboard/chat"
          aria-label="New AI chat"
          className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-saffron-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 lg:hidden"
        >
          <Plus className="h-5 w-5" />
        </Link>
      )}

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
