"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { RecentSubmission } from "@/services/instructor/dashboardHome.service";

export function RecentSubmissionsList({ submissions, isLoading }: { submissions: RecentSubmission[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
        <h3 className="text-sm font-black text-slate-200">Recent Submissions</h3>
        <Link href="/instructor/assignments" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
          View all
        </Link>
      </div>

      <div className="space-y-4 mt-2">
        {submissions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent submissions</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg shrink-0">
                  <FileText size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{sub.studentName}</p>
                  <p className="text-[10px] text-slate-500">{sub.assignmentName}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {sub.status}
                </span>
                <span className="text-[9px] text-slate-500">{sub.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
