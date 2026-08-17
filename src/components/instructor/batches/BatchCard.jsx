"use client";

import { Users, TrendingUp, CheckCircle2, AlertTriangle, MinusCircle, Calendar } from "lucide-react";

import BatchActionsMenu from "@/components/instructor/batches/BatchActionsMenu";

const STATUS_DOT_COLOR = {
  ACTIVE: "bg-emerald-400",
  COMPLETED: "bg-sky-400",
  ARCHIVED: "bg-slate-500",
};

const STATUS_TEXT_COLOR = {
  ACTIVE: "text-emerald-400",
  COMPLETED: "text-sky-400",
  ARCHIVED: "text-slate-500",
};

// engagementStatus is the only real, already-computed health signal this overview payload sends
// per batch (batch.service.js#getBatchPerformanceOverview strips the raw at-risk student id list
// before it ever reaches the client) — so the health line is worded from that real field, never a
// fabricated "N at risk" count the frontend doesn't actually have.
const HEALTH_META = {
  High: { label: "On Track", icon: CheckCircle2, classes: "text-emerald-400" },
  Moderate: { label: "On Track", icon: CheckCircle2, classes: "text-amber-400" },
  Low: { label: "Needs Attention", icon: AlertTriangle, classes: "text-rose-400" },
  "No Data": { label: "No Data", icon: MinusCircle, classes: "text-slate-500" },
};

function StatCell({ icon: Icon, label, value, valueClassName = "text-slate-100" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 text-center">
      <div className={`flex items-center gap-1 text-[13px] font-black leading-none ${valueClassName}`}>
        <Icon size={12} className="shrink-0 opacity-70" />
        {value}
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

/** Batch card for the Batches dashboard grid. */
export default function BatchCard({ batch }) {
  const status = batch.status || "ACTIVE";
  const startedLabel = batch.startDate
    ? new Date(batch.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : null;
  const health = HEALTH_META[batch.engagementStatus] || HEALTH_META["No Data"];
  // A batch can legitimately span multiple courses that happen to share a title (or the same
  // course counted twice via multiple courseIds) — dedupe the DISPLAY text only, never the
  // underlying courseIds/data, so the header never repeats "Python Basics, Python Basics".
  const courseLabel = [...new Set(batch.courseTitles || [])].join(", ");

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          {courseLabel && (
            <p className="truncate text-[10.5px] text-slate-500" title={courseLabel}>
              {courseLabel}
            </p>
          )}
          <p className="mt-0.5 truncate text-base font-black leading-tight text-white">{batch.name}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1A1F35] px-2 py-1 text-[9px] font-black uppercase tracking-wider ${STATUS_TEXT_COLOR[status] || "text-slate-400"}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLOR[status] || "bg-slate-500"}`} />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#1A1F35]/70 bg-white/[0.015] py-3">
        <StatCell icon={Users} label="Students" value={batch.studentsCount} />
        <StatCell icon={TrendingUp} label="Progress" value={`${batch.completion}%`} />
        <StatCell icon={health.icon} label="Health" value={health.label} valueClassName={health.classes} />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
          <span>Course Progress</span>
          <span className="text-slate-300">{batch.completion}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${batch.completion}%` }} />
        </div>
      </div>

      {startedLabel && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Calendar size={11} className="shrink-0" />
          Started {startedLabel}
        </div>
      )}

      <BatchActionsMenu batch={batch} />
    </div>
  );
}
