"use client";

import Link from "next/link";
import { Users, Star, Code2 } from "lucide-react";

const STATUS_STYLES = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

function completionColor(rate) {
  if (rate >= 75) return "bg-emerald-500";
  if (rate >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export function CoursePerformanceTable({ courses = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-foreground">Course Performance</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Top courses by enrollment</p>
        </div>
        <Link href="/admin/courses" className="text-[11px] text-primary font-bold flex items-center gap-1 hover:text-orange-300">
          View all courses &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black">
              <th className="pb-3 font-medium">Course</th>
              <th className="pb-3 font-medium text-center">Students</th>
              <th className="pb-3 font-medium text-center">Completion</th>
              <th className="pb-3 font-medium text-center">Rating</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">No courses available</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Code2 size={16} className="text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{course.title}</p>
                        <p className="text-[10px] text-muted-foreground">{course.category} &bull; {course.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-foreground text-xs font-bold">
                      <Users size={14} className="text-muted-foreground" />
                      {course.students}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${completionColor(course.completionRate)}`}
                          style={{ width: `${Math.min(course.completionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground w-7">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    {course.avgRating > 0 ? (
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
                        <Star size={12} className="fill-amber-400" />
                        {course.avgRating}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600">No reviews</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${STATUS_STYLES[course.status] || "bg-muted text-muted-foreground border-transparent"}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="px-3 py-1.5 rounded-lg border border-primary/30 text-[10px] font-bold text-primary hover:bg-primary/10 transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
