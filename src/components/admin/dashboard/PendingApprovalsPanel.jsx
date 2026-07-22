"use client";

import { Clock, ArrowRight, ChevronRight } from "lucide-react";

export default function PendingApprovalsPanel({ pendingData, onOpenAction }) {
  const { totalPending, lastUpdated, items = [] } = pendingData || {};

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Pending Approvals
              <span className="inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/30">
                {totalPending} Items
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Updated {lastUpdated}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "queue_approvals", title: "Global Approvals Queue" })}
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
        >
          Review Queue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Items List */}
      <div className="mt-3.5 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold border ${getPriorityStyle(item.priority)}`}>
                  {item.priority}
                </span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{item.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{item.details}</p>
            </div>

            <button
              onClick={() => onOpenAction({ type: "review_item", title: `Review: ${item.title}`, data: item })}
              className="flex items-center justify-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400 shrink-0 self-end sm:self-center"
            >
              <span>Review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
