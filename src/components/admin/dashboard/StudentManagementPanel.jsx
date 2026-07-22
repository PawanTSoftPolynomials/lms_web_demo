"use client";

import { UserX, ArrowRight, ChevronRight } from "lucide-react";

export default function StudentManagementPanel({ studentData, onOpenAction }) {
  const { attentionCount = 0, students = [] } = studentData || {};

  const getTargetAction = (st) => {
    if (st.status.includes("Payment")) {
      return {
        text: "Open Finance",
        type: "view_payment_detail",
        title: `Finance & Payment Action: ${st.name}`
      };
    }
    if (st.status.includes("Certificate")) {
      return {
        text: "Open Certificate Center",
        type: "all_certificates",
        title: `Certificate Hold Action: ${st.name}`
      };
    }
    return {
      text: "Open Student Profile",
      type: "view_student_profile",
      title: `Student Intervention Profile: ${st.name}`
    };
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
            <UserX className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Student Intervention Queue
              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                {attentionCount} Require Action
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Students behind schedule, holds & payment alerts</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_students", title: "Global Student Directory" })}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
        >
          All Directory <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Student List */}
      <div className="mt-3.5 flex-1 space-y-3 overflow-y-auto pr-1">
        {students.map((st) => {
          const action = getTargetAction(st);
          return (
            <div
              key={st.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 transition hover:border-slate-700 hover:bg-slate-950"
            >
              <div>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-extrabold text-rose-400 border border-rose-500/30">
                  {st.status}
                </span>
                <h4 className="text-xs font-bold text-white mt-1.5">{st.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Course: <span className="text-slate-300 font-semibold">{st.course}</span>
                </p>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onOpenAction({ type: action.type, title: action.title, data: st })}
                  className="flex items-center gap-1.5 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition"
                >
                  <span>{action.text}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
