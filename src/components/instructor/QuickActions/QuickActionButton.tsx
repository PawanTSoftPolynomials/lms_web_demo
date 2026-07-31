"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import type { QuickActionItem } from "./quickActionItems";

export function QuickActionButton({ label, href, icon: Icon, actionType, onClick }: QuickActionItem & { onClick?: () => void }) {
  const content = (
    <>
      <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-primary group-hover:from-orange-500/25 group-hover:to-pink-500/25 transition-colors">
        <Icon className="size-3.5" />
      </span>
      {label}
    </>
  );

  const className = "group flex items-center gap-2.5 rounded-xl border border-card-border bg-card px-4 py-3 text-xs font-bold text-foreground shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="shrink-0">
          {href ? (
            <Link href={href} className={className}>
              {content}
            </Link>
          ) : (
            <button type="button" className={className} onClick={onClick}>
              {content}
            </button>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
