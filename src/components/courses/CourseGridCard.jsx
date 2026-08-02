"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Users, Layers, FileText } from "lucide-react";

import CourseStatusBadge from "@/components/courses/CourseStatusBadge";
import CourseActionsMenu from "@/components/courses/CourseActionsMenu";

/** Compact grid card for the My Courses grid view — deliberately not a marketplace-style card. */
export default function CourseGridCard({ course }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 flex flex-col gap-3 hover:border-slate-700 transition cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BookOpen size={17} className="text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-200 truncate">{course.title}</p>
          <p className="text-[10px] text-slate-500 truncate">{course.category || "Uncategorized"}</p>
        </div>
        <CourseStatusBadge status={course.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-[#1A1F35]/70">
        <div>
          <p className="text-[13px] font-black text-slate-200 flex items-center justify-center gap-1"><Users size={11} className="text-slate-500" />{course._count?.enrollments ?? 0}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Students</p>
        </div>
        <div>
          <p className="text-[13px] font-black text-slate-200 flex items-center justify-center gap-1"><Layers size={11} className="text-slate-500" />{course._count?.modules ?? 0}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Modules</p>
        </div>
        <div>
          <p className="text-[13px] font-black text-slate-200 flex items-center justify-center gap-1"><FileText size={11} className="text-slate-500" />{course.stats?.lessonsCount ?? 0}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Lessons</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {course.updatedAt ? `Updated ${formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}` : "—"}
        </span>
        <CourseActionsMenu course={course} />
      </div>
    </div>
  );
}
