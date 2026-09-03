"use client";

import Link from "next/link";
import { Users, MoreVertical, Code2 } from "lucide-react";
import type { CourseProgressOverview } from "@/services/instructor/dashboardHome.service";

export function CourseOverviewTable({ courses, isLoading }: { courses: CourseProgressOverview[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-200">Course Overview</h3>
        <Link href="/instructor/courses" className="text-[11px] text-orange-400 font-bold flex items-center gap-1 hover:text-orange-300">
          View all courses &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1A1F35] text-[9px] uppercase tracking-widest text-slate-500 font-black">
              <th className="pb-3 font-medium">Course</th>
              <th className="pb-3 font-medium text-center">Students</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-slate-500">No courses available</td>
              </tr>
            ) : (
              courses.slice(0, 4).map((course) => (
                <tr key={course.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#9E9E9E] rounded-lg">
                        <Code2 size={16} className="text-sky-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{course.courseName}</p>
                        <p className="text-[10px] text-slate-500">{course.batch} &bull; {course.students} Students</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs font-bold">
                      <Users size={14} className="text-slate-500" />
                      {course.students}
                    </div>
                  </td>
                  <td className="py-4 px-2 w-1/3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 w-8">{course.progress}%</span>
                      <div className="h-1.5 w-full bg-[#9E9E9E] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${course.progress}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/instructor/courses/${course.id}`}
                        className="px-3 py-1.5 rounded-lg border border-orange-500/30 text-[10px] font-bold text-orange-400 hover:bg-orange-500/10 transition"
                      >
                        View
                      </Link>
                      <button className="p-1 text-slate-500 hover:text-slate-300">
                        <MoreVertical size={16} />
                      </button>
                    </div>
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
