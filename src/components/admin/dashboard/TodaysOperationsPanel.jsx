"use client";

import { useState } from "react";
import { Calendar, Video, BookOpen, Clock, Users, Wrench, ChevronRight } from "lucide-react";

export default function TodaysOperationsPanel({ operationsData, onOpenAction }) {
  const [activeTab, setActiveTab] = useState("today");

  const activeList = operationsData?.[activeTab] || [];

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "live session":
        return <Video className="h-3.5 w-3.5 text-blue-400" />;
      case "quiz deadline":
      case "assignment deadline":
        return <BookOpen className="h-3.5 w-3.5 text-amber-400" />;
      case "instructor meeting":
        return <Users className="h-3.5 w-3.5 text-emerald-400" />;
      case "maintenance":
        return <Wrench className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <Calendar className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Today's Operations</h3>
            <p className="text-[11px] text-slate-400">Live sessions & deadlines</p>
          </div>
        </div>

        {/* Grouping Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
          {["today", "tomorrow", "upcoming"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                activeTab === tab
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      <div className="mt-3.5 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {activeList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No scheduled operations for this period.</div>
        ) : (
          activeList.map((op) => (
            <div
              key={op.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700 hover:bg-slate-950"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800">
                  {getTypeIcon(op.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{op.type}</span>
                    <span className="text-[10px] font-semibold text-orange-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {op.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-0.5">{op.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {op.instructor && `Instructor: ${op.instructor} • `}
                    {op.attendees && `${op.attendees} Enrolled Attendees`}
                    {op.enrolled && `${op.enrolled} Students Enrolled`}
                    {op.impact && `Impact: ${op.impact}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenAction({ type: "operation_detail", title: `Operation: ${op.title}`, data: op })}
                className="text-xs font-bold text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
