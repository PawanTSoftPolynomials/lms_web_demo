"use client";

import { formatTime, formatDueIn } from "@/lib/dateUtils";
import { getBadgeStyle, getEventIcon, getMobileEventBadge } from "@/features/student/utils/dashboardHelpers";

export default function UpcomingEventCard({ task, variant = "desktop" }) {
  const Icon = getEventIcon(task.type);

  if (variant === "mobile") {
    const badge = getMobileEventBadge(task.type);
    return (
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#141930] border border-[#1A1F35] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-slate-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">{formatDueIn(task._date)}</p>
        </div>
        <span className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>
    );
  }

  const badge = getBadgeStyle(task.type);
  const timeLabel = task.startTime ? formatTime(task.startTime) : "All Day";

  return (
    <div className="p-3 rounded-xl border bg-[#141930] border-[#1A1F35] hover:border-slate-700 transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border ${badge.className}`}>
            <Icon size={15} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
            <p className="text-[10px] text-slate-400 truncate">{task.courseName || task.subtitle || badge.label}</p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-black text-sky-400">{timeLabel}</span>
      </div>
    </div>
  );
}
