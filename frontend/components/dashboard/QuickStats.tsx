"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, Hash, Globe2 } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const stats = [
  {
    label: "Schemes",
    value: 13,
    suffix: "",
    icon: Landmark,
    href: "/dashboard/schemes",
    color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
  },
  {
    label: "HS Chapters",
    value: 49,
    suffix: "",
    icon: Hash,
    href: "/dashboard/hs-codes",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  },
  {
    label: "Markets",
    value: 20,
    suffix: "+",
    icon: Globe2,
    href: "/dashboard/fta",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
];

export function QuickStats() {
  return (
    <motion.div
      className="grid grid-cols-3 gap-3"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            variants={{
              hidden:  { opacity: 0, y: 10, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
            }}
            whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 22 } }}
            whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
          >
            <Link
              href={s.href}
              className="group relative block overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-zinc-200 transition-shadow hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800"
            >
              {/* faint icon watermark */}
              <Icon className="absolute right-3 top-3 h-10 w-10 opacity-5 dark:opacity-[0.04]" />
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <AnimatedCounter target={s.value} suffix={s.suffix} duration={1.5} />
              </p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
