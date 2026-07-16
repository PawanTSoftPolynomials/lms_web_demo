"use client";

import { GraduationCap } from "lucide-react";

export default function DifficultyBadge({ level }) {
  if (!level) return null;
  const cleanLevel = level.toUpperCase();
  
  let style = "bg-blue-500/10 text-blue-400 border-blue-500/25";
  if (cleanLevel.includes("ADVANCED")) {
    style = "bg-red-500/10 text-red-400 border-red-500/25";
  } else if (cleanLevel.includes("INTERMEDIATE")) {
    style = "bg-purple-500/10 text-purple-400 border-purple-500/25";
  } else if (cleanLevel.includes("BEGINNER")) {
    style = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style}`}>
      <GraduationCap size={13} />
      {level}
    </span>
  );
}
