"use client";

import Link from "next/link";
import { Settings, Layers, FileText, Users, Calendar } from "lucide-react";

import CourseMetaItem from "./CourseMetaItem";

export default function InstructorCourseCard({ course }) {
  if (!course) return null;

  const isPublished = course.status === "Published" || course.status === "PUBLISHED";

  // Calculate total lessons recursively
  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length ?? 0), 0) ?? 0;

  // Format last updated timestamp
  const lastUpdatedStr = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Jul 3, 2026";

  return (
    <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-slate-700/60 hover:shadow-2xl hover:shadow-slate-950/60 transition-all duration-400 flex flex-col justify-between min-h-[280px]">
      
      {/* Top Header Section */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 min-w-0">
            {course.category && (
              <span className="inline-block rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                {course.category}
              </span>
            )}
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-orange-500 transition-colors duration-300 truncate">
              {course.title}
            </h3>
          </div>
        </div>

        {/* Separator Divider */}
        <div className="border-b border-slate-800/80 my-4" />

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`h-2 w-2 rounded-full ${
            isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`} />
          <span className={isPublished ? "text-emerald-400" : "text-amber-400"}>
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Middle Stats Details Section */}
      <div className="mt-5 space-y-3.5">
        <div className="grid grid-cols-3 gap-2">
          <CourseMetaItem icon={Layers} text={`${course.modules?.length ?? 0} Modules`} />
          <CourseMetaItem icon={FileText} text={`${totalLessons} Lessons`} />
          <CourseMetaItem icon={Users} text={`${course.enrollments?.length ?? 0} Students`} />
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Calendar size={12} />
          <span>Last updated {lastUpdatedStr}</span>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="mt-5">
        <Link
          href={`/instructor/courses/${course.id}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 border border-slate-700/80 hover:border-orange-500/60 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-black uppercase tracking-widest py-3 text-center transition-all duration-300"
        >
          <Settings size={14} className="shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          <span>Manage Course</span>
        </Link>
      </div>

    </div>
  );
}
