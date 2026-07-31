"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types/instructor-dashboard";

const ACCENT_STYLES: Record<DashboardStat["accent"], string> = {
  orange: "from-orange-500/15 to-orange-500/5 text-orange-500",
  pink: "from-pink-500/15 to-pink-500/5 text-pink-500",
  sky: "from-sky-500/15 to-sky-500/5 text-sky-500",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-500",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-500",
  amber: "from-amber-500/15 to-amber-500/5 text-amber-500",
};

export function StatsCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;

  const content = (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="h-full rounded-2xl border border-card-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-shadow duration-200"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl bg-gradient-to-br",
          ACCENT_STYLES[stat.accent]
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <p className="mt-3 text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{stat.label}</p>
      <p className="text-[10.5px] text-muted-foreground/80 mt-0.5">{stat.subtitle}</p>

      {stat.meta && (
        <p className="mt-2 pt-2 border-t border-card-border text-[10.5px] font-bold text-primary truncate">
          {stat.meta}
        </p>
      )}
    </motion.div>
  );

  if (!stat.href) return content;

  return (
    <Link href={stat.href} className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
