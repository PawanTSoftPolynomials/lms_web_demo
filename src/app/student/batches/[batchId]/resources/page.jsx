"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FolderOpen, FileText, ChevronRight } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";

// The batch dashboard doesn't carry a distinct "downloadable resource"
// entity — course material lives on lessons themselves. This surfaces the
// real lesson list (grouped by module) as the batch's resources, linking
// into the actual course player rather than inventing a separate file list.
export default function BatchResourcesPage() {
  const params = useParams();
  const { data: dashboard, isLoading } = useBatchDashboard(params.batchId);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-14 rounded-2xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const modules = dashboard?.course?.modules ?? [];
  const courseId = dashboard?.course?.id;

  if (modules.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-2xl">
        No course materials published for this batch yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
          <h3 className="text-xs font-black text-white mb-2.5 flex items-center gap-2">
            <FolderOpen size={14} className="text-orange-400" /> {module.title}
          </h3>
          {module.lessons?.length ? (
            <div className="space-y-1.5">
              {module.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/student/learn/${courseId}`}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <FileText size={14} className="text-slate-500 shrink-0" />
                  <span className="truncate flex-1">{lesson.title}</span>
                  <ChevronRight size={14} className="text-slate-600 shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">No lessons in this module yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
