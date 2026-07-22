"use client";

import { UserCheck, ArrowRight, ChevronRight } from "lucide-react";

export default function EnrollmentCenterPanel({ enrollmentData, onOpenAction }) {
  const {
    pendingRequests = 0,
    bulkQueueCount = 0,
    waitingListCount = 0,
    recentRequests = []
  } = enrollmentData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Enrollment Center</h3>
            <p className="text-[11px] text-slate-400">Manual, bulk enterprise & waiting list requests</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_enrollments", title: "Global Enrollment Operations Center" })}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
        >
          Open Enrollment Queue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Pending Requests</p>
          <p className="text-base font-extrabold text-blue-400">{pendingRequests}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Bulk Batches</p>
          <p className="text-base font-extrabold text-emerald-400">{bulkQueueCount}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Waitlist</p>
          <p className="text-base font-extrabold text-amber-400">{waitingListCount}</p>
        </div>
      </div>

      {/* Queue items */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {recentRequests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700"
          >
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase">{req.type}</span>
              <h4 className="text-xs font-bold text-white mt-0.5">{req.student}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{req.course}</p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "approve_enrollment", title: `Review Enrollment Request: ${req.student}`, data: req })}
                className="flex items-center gap-1.5 rounded border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition"
              >
                <span>Review Request</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
