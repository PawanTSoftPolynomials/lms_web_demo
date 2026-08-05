"use client";

import { Users, TrendingUp, FileCheck2, BookOpenCheck, Flame, Calendar } from "lucide-react";

import BatchActionsMenu from "@/components/instructor/batches/BatchActionsMenu";

const ENGAGEMENT_ICON_COLOR = {
  High: "text-emerald-400",
  Moderate: "text-amber-400",
  Low: "text-rose-400",
  "No Data": "text-slate-500",
};

function StatCell({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-black text-slate-200 flex items-center justify-center gap-1">
        <Icon size={11} className="text-slate-500" />
        {value}
      </p>
      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

/** Rich batch card for the Batches dashboard grid — replaces the old plain table row. */
export default function BatchCard({ batch }) {
  const startedLabel = batch.startDate
    ? new Date(batch.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 flex flex-col gap-3 hover:border-slate-700 transition">
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 truncate">{batch.courseTitle}</p>
        <p className="text-sm font-black text-slate-100 truncate">{batch.name}</p>
        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {batch.status || "ACTIVE"}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 py-2.5 border-y border-[#1A1F35]/70">
        <StatCell icon={Users} label="Students" value={batch.studentsCount} />
        <StatCell icon={TrendingUp} label="Completion" value={`${batch.completion}%`} />
        <StatCell icon={FileCheck2} label="Avg Quiz" value={batch.avgQuizScore != null ? `${batch.avgQuizScore}%` : "N/A"} />
        <StatCell icon={BookOpenCheck} label="Lessons" value={`${batch.lessonsCompletedPercent}%`} />
        <StatCell
          icon={Flame}
          label="Engagement"
          value={<span className={ENGAGEMENT_ICON_COLOR[batch.engagementStatus] || "text-slate-500"}>{batch.engagementStatus}</span>}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          <span>Course Progress</span>
          <span className="text-slate-300">{batch.completion}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
            style={{ width: `${batch.completion}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Calendar size={11} />
        Started {startedLabel}
      </div>

      <BatchActionsMenu batch={batch} />
    </div>
  );
}
