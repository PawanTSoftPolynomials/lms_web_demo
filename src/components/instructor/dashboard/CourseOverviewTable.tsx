"use client";

import Link from "next/link";
import { Users, MoreVertical, Code2 } from "lucide-react";
import type { CourseProgressOverview } from "@/services/instructor/dashboardHome.service";

export function CourseOverviewTable({ courses, isLoading }: { courses: CourseProgressOverview[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-foreground">Course Overview</h3>
        <Link href="/instructor/courses" className="text-[11px] text-primary font-bold flex items-center gap-1 hover:opacity-80">
          View all courses &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black">
              <th className="pb-3 pr-2 font-medium whitespace-nowrap">Course</th>
              <th className="pb-3 px-2 font-medium text-center whitespace-nowrap">Students</th>
              <th className="pb-3 px-2 font-medium whitespace-nowrap">Progress</th>
              <th className="pb-3 pl-2 font-medium text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No courses available</td>
              </tr>
            ) : (
              courses.slice(0, 4).map((course) => (
                <tr key={course.id} className="hover:bg-foreground/5 transition">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Code2 size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{course.courseName}</p>
                        <p className="text-[10px] text-muted-foreground">{course.batch} &bull; {course.students} Students</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-foreground text-xs font-bold">
                      <Users size={14} className="text-muted-foreground" />
                      {course.students}
                    </div>
                  </td>
                  <td className="py-4 px-2 w-1/3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground w-8">{course.progress}%</span>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${course.progress}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/instructor/courses/${course.id}`}
                        className="px-3 py-1.5 rounded-lg border border-primary/30 text-[10px] font-bold text-primary hover:bg-primary/10 transition"
                      >
                        View
                      </Link>
                      <button className="p-1 text-muted-foreground hover:text-foreground">
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
