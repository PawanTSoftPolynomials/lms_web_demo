"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BatchAssignmentsPage() {
  const params = useParams();
  const { data: dashboard, isLoading } = useBatchDashboard(params.batchId);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 rounded-2xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const assignments = dashboard?.course?.assignments ?? [];

  if (assignments.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-2xl">
        No assignments for this batch&apos;s course yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {assignments.map((assignment) => (
        <Link
          key={assignment.id}
          href={`/student/assignments/${assignment.id}`}
          className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-3.5 flex items-center gap-3 hover:border-slate-700 transition"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ClipboardList size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{assignment.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Due {formatDate(assignment.dueDate)}</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 shrink-0" />
        </Link>
      ))}
    </div>
  );
}
