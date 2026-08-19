"use client";

import { Users, BookOpen } from "lucide-react";

const PRIORITY_STYLE = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/25",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  LOW: "bg-slate-700/40 text-slate-300 border-slate-600/40",
};

export default function RecommendationCard({ recommendation }) {
  const priorityStyle = PRIORITY_STYLE[recommendation.priority] || PRIORITY_STYLE.LOW;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5 hover:border-slate-700 transition">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${priorityStyle}`}>
          {recommendation.priority || "LOW"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <BookOpen size={12} />
          {recommendation.courseTitle}
        </span>
      </div>

      <p className="text-sm font-semibold text-white leading-snug">{recommendation.suggestedAction}</p>

      {recommendation.reason && (
        <p className="text-xs text-slate-400 leading-relaxed">{recommendation.reason}</p>
      )}

      {typeof recommendation.affectedStudentCount === "number" && recommendation.affectedStudentCount > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <Users size={12} />
          <span>{recommendation.affectedStudentCount} student{recommendation.affectedStudentCount === 1 ? "" : "s"} affected</span>
        </div>
      )}
    </div>
  );
}
