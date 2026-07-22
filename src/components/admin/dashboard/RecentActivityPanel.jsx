"use client";

import { useState } from "react";
import { History, ExternalLink, User, Clock, ChevronRight } from "lucide-react";

export default function RecentActivityPanel({ activityData, onOpenAction }) {
  const [activeGroup, setActiveGroup] = useState("today");

  const activeActivities = activityData?.[activeGroup] || [];

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Activity Audit Log</h3>
            <p className="text-[11px] text-slate-400">Timestamped administrative & system audit trail</p>
          </div>
        </div>

        {/* Grouping */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
          {["today", "yesterday", "earlier"].map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                activeGroup === group
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="mt-3.5 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {activeActivities.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                {act.userAvatar ? (
                  <img src={act.userAvatar} alt={act.user} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase">{act.category}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {act.time}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mt-0.5">{act.action}</h4>
                <p className="text-[11px] text-slate-400">
                  By <span className="text-slate-300 font-medium">{act.user}</span> • {act.details}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAction({ type: "audit_detail", title: `Audit Record: ${act.action}`, data: act })}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-orange-400 shrink-0 transition"
            >
              <span>Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
