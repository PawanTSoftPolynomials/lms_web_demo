"use client";

import Link from "next/link";
import { Users, MoreVertical, Code2 } from "lucide-react";
import type { CourseProgressOverview } from "@/services/instructor/dashboardHome.service";

export function CourseOverviewTable({ courses, isLoading }: { courses: CourseProgressOverview[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 shadow-luxury-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-2"><div className="h-2.5 w-14 rounded bg-muted animate-pulse" /></th>
                <th className="pb-3 px-2"><div className="h-2.5 w-14 rounded bg-muted animate-pulse mx-auto" /></th>
                <th className="pb-3 px-2"><div className="h-2.5 w-14 rounded bg-muted animate-pulse" /></th>
                <th className="pb-3 pl-2"><div className="h-2.5 w-14 rounded bg-muted animate-pulse ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                        <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="h-3 w-6 rounded bg-muted animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-2 w-1/3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-8 rounded bg-muted animate-pulse shrink-0" />
                      <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-6 w-14 rounded-lg bg-muted animate-pulse" />
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-luxury-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-foreground">Course Overview</h3>
        <Link href="/instructor/courses" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
          View all courses &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-caption uppercase text-muted-foreground">
              <th className="pb-3 pr-2 font-semibold tracking-wider">Course</th>
              <th className="pb-3 px-2 font-semibold text-center tracking-wider">Students</th>
              <th className="pb-3 px-2 font-semibold tracking-wider">Progress</th>
              <th className="pb-3 pl-2 font-semibold text-right tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No courses available</td>
              </tr>
            ) : (
              courses.slice(0, 4).map((course) => (
                <tr key={course.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl shrink-0">
                        <Code2 size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-foreground">{course.courseName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{course.batch} &bull; {course.students} Students</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-foreground text-xs font-bold">
                      <Users size={13} className="text-muted-foreground" />
                      {course.students}
                    </div>
                  </td>
                  <td className="py-3.5 px-2 w-1/3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground w-8">{course.progress}%</span>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/instructor/courses/${course.id}`}
                        className="px-3 py-1 rounded-lg border border-primary/30 text-xs font-bold text-primary hover:bg-primary/10 transition"
                      >
                        View
                      </Link>
                      <button className="p-1 text-muted-foreground hover:text-foreground transition cursor-pointer">
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
