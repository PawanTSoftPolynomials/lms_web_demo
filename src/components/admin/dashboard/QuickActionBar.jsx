"use client";

import { useState } from "react";
import {
  BookPlus,
  UserPlus,
  UserCheck,
  Award,
  Megaphone,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  Zap,
  Activity,
  Download
} from "lucide-react";

export default function QuickActionBar({ onOpenAction }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const actions = [
    {
      id: "create_course",
      label: "Create Course",
      icon: BookPlus,
      color: "hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-400"
    },
    {
      id: "add_instructor",
      label: "Add Instructor",
      icon: UserPlus,
      color: "hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400"
    },
    {
      id: "enroll_student",
      label: "Enroll Student",
      icon: UserCheck,
      color: "hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400"
    },
    {
      id: "generate_certificate",
      label: "Generate Certificate",
      icon: Award,
      color: "hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400"
    },
    {
      id: "publish_announcement",
      label: "Publish Announcement",
      icon: Megaphone,
      color: "hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400"
    },
    {
      id: "create_batch",
      label: "Create Batch",
      icon: Layers,
      color: "hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400"
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Quick Actions Title */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Actions</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar py-0.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onOpenAction({ type: act.id, title: act.label })}
                className={`flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all duration-150 shrink-0 ${act.color} active:scale-95`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* More Dropdown */}
        <div className="relative shrink-0 border-l border-slate-800 pl-2">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-900 transition"
          >
            <span>More</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in duration-100">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAction({ type: "export_audit_logs", title: "Export System Compliance & Audit Logs" });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export Compliance Log
              </button>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAction({ type: "trigger_diagnostics", title: "Run Infrastructure Diagnostic Scan" });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md"
              >
                <Activity className="h-3.5 w-3.5 text-blue-400" /> Run Diagnostics
              </button>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAction({ type: "export_db_backup", title: "Trigger On-Demand DB Backup" });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md border-t border-slate-800/80 mt-1 pt-2"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" /> Download DB Snapshot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
