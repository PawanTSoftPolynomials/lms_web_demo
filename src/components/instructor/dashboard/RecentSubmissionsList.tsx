"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { RecentSubmission } from "@/services/instructor/dashboardHome.service";

export function RecentSubmissionsList({ submissions, isLoading }: { submissions: RecentSubmission[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">Recent Submissions</h3>
        <Link href="/instructor/assignments" className="text-[11px] text-primary font-bold hover:opacity-80">
          View all
        </Link>
      </div>

      <div className="space-y-4 mt-2">
        {submissions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No recent submissions</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{sub.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">{sub.assignmentName}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {sub.status}
                </span>
                <span className="text-[9px] text-muted-foreground">{sub.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
