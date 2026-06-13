"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, LogIn, UserPlus, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";
import { useClerk } from "@clerk/nextjs";

const navGroups = [
  {
    label: null,
    links: [
      { href: "/", label: "Home" },
    ],
  },
  {
    label: "AI Tools",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/chat", label: "AI Chat" },
      { href: "/dashboard/readiness", label: "Readiness Score" },
      { href: "/dashboard/schemes/wizard", label: "Find My Schemes" },
      { href: "/dashboard/checklist", label: "Doc Checklist" },
      { href: "/dashboard/fta", label: "FTA Advantage" },
    ],
  },
  {
    label: "Reference",
    links: [
      { href: "/dashboard/schemes", label: "Gov. Schemes" },
      { href: "/dashboard/glossary", label: "Glossary" },
      { href: "/dashboard/hs-codes", label: "HS Code Lookup" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useUserStore();

  // Close on route change
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl dark:bg-zinc-950 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            {/* Tricolor top stripe */}
            <div className="h-0.5 w-full shrink-0" style={{ background: "linear-gradient(to right, #FF9933 33.333%, #ffffff 33.333% 66.666%, #138808 66.666%)" }} />

            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="tricolor-gradient inline-block h-6 w-[18px] rounded-sm ring-1 ring-zinc-300 dark:ring-zinc-600" />
                <span className="text-[15px] font-extrabold text-zinc-900 dark:text-zinc-50">
                  India<span className="text-saffron-500">2</span>World
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {profile.isLoggedIn && (
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
                  {profile.businessName || "My Account"}
                </p>
                <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
              </div>
            )}

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {navGroups.map((group) => (
                <div key={group.label ?? "top"}>
                  {group.label && (
                    <p className="mb-1 mt-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      {group.label}
                    </p>
                  )}
                  {group.links.map((link) => {
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : link.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-saffron-50 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-400"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              {profile.isLoggedIn ? (
                <MobileNavSignOut onClose={onClose} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 rounded-full bg-saffron-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-saffron-600"
                  >
                    <UserPlus className="h-4 w-4" />
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileNavSignOut({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const logout = useUserStore((s) => s.logout);

  const handleSignOut = async () => {
    logout();
    onClose();
    await signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
