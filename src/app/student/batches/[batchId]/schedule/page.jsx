"use client";

import { useParams } from "next/navigation";
import { Calendar, FileCheck2 } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";
import { formatShortDate } from "@/lib/dateUtils";

export default function BatchSchedulePage() {
  const params = useParams();
  const { data: dashboard, isLoading } = useBatchDashboard(params.batchId);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const sessions = dashboard?.sessions ?? [];
  const exams = dashboard?.exams ?? [];
  const items = [
    ...sessions.map((s) => ({ ...s, kind: "Session" })),
    ...exams.map((e) => ({ ...e, kind: "Exam" })),
  ].sort((a, b) => new Date(a.startDate || a.dueDate || 0) - new Date(b.startDate || b.dueDate || 0));

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
        No sessions or exams scheduled for this batch yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={`${item.kind}-${item.id}`} className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
              item.kind === "Exam"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
          >
            {item.kind === "Exam" ? <FileCheck2 size={17} /> : <Calendar size={17} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {item.kind} &middot; {formatShortDate(item.startDate || item.dueDate, "Date TBA")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
