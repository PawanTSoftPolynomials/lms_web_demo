"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { RecentSubmission } from "@/services/instructor/dashboardHome.service";

export function RecentSubmissionsList({ submissions, isLoading }: { submissions: RecentSubmission[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 h-full shadow-luxury-sm">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-12 rounded bg-muted animate-pulse" />
        </div>

        <div className="space-y-4 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="h-3.5 w-14 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-10 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full shadow-luxury-sm">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-extrabold text-foreground">Recent Submissions</h3>
        <Link href="/instructor/assignments" className="text-xs text-primary font-bold hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-3.5 mt-2">
        {submissions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No recent submissions</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="flex items-start justify-between p-2.5 rounded-xl border border-border/50 bg-surface-muted/30 hover:border-border transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{sub.studentName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub.assignmentName}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {sub.status}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold">{sub.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
