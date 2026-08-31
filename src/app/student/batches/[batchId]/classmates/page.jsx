"use client";

import { useParams } from "next/navigation";
import { User } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";

export default function BatchClassmatesPage() {
  const params = useParams();
  const { data: dashboard, isLoading } = useBatchDashboard(params.batchId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const classmates = dashboard?.students ?? [];

  if (classmates.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
        No other students in this batch yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {classmates.map((student) => (
        <div key={student.id} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0">
            {student.user?.name?.[0]?.toUpperCase() || <User size={16} />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{student.user?.name || "Student"}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{student.user?.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
