"use client";

import { Users, ArrowRight, ChevronRight } from "lucide-react";

export default function InstructorManagementPanel({ instructorData, onOpenAction }) {
  const { attentionCount = 0, instructors = [] } = instructorData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Instructor Management
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {attentionCount} Action Needed
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Applications pending, unassigned courses & schedules</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_instructors", title: "Faculty Directory & Roster" })}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          Open Faculty Console <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Instructor List */}
      <div className="mt-3.5 flex-1 space-y-3 overflow-y-auto pr-1">
        {instructors.map((ins) => (
          <div
            key={ins.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                {ins.status}
              </span>
              <h4 className="text-xs font-bold text-white mt-1.5">{ins.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dept: <span className="text-slate-300 font-semibold">{ins.dept}</span> • Assigned: {ins.courses} Courses
              </p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "view_instructor_profile", title: `Faculty Management: ${ins.name}`, data: ins })}
                className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <span>{ins.status.includes("Application") ? "Review Application" : "Open Faculty Management"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
