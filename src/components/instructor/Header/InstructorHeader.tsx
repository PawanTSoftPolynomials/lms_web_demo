"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/shadcn/theme-toggle";

interface InstructorHeaderProps {
  instructorName: string;
  avatarUrl?: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function InstructorHeader({ instructorName }: InstructorHeaderProps) {
  const firstName = instructorName?.split(" ")[0] || instructorName;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {getGreeting()}, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex items-center rounded-xl border border-card-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
          {today}
        </div>

        <ThemeToggle />
      </div>
    </div>
  );
}
