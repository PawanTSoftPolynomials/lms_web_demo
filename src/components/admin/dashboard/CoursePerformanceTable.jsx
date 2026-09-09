"use client";

import Link from "next/link";
import { Star } from "lucide-react";

/**
 * Top courses by enrollment, with the numbers an admin judges a course on.
 *
 * Status is a read-only indicator, so it is a coloured dot plus plain text
 * rather than a bordered pill, and "View" navigates, so it is an anchor in link
 * colour rather than something wearing button chrome.
 *
 * The table keeps a min-width inside its scroll container: six columns cannot
 * fit a phone, and without it the columns squash into an unreadable smear
 * instead of letting the table scroll sideways.
 */
const STATUS_DOT = {
  PUBLISHED: "bg-success",
  DRAFT: "bg-warning",
  ARCHIVED: "bg-muted-foreground",
};

function completionColor(rate) {
  if (rate >= 75) return "bg-success";
  if (rate >= 40) return "bg-warning";
  return "bg-destructive";
}

export function CoursePerformanceTable({ courses = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Course performance</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Top courses by enrollment</p>
        </div>
        <Link
          href="/admin/courses"
          className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-link hover:text-link-hover hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs font-medium text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Course</th>
              <th className="pb-3 px-2 text-center font-medium">Students</th>
              <th className="pb-3 px-2 text-center font-medium">Completion</th>
              <th className="pb-3 px-2 text-center font-medium">Rating</th>
              <th className="pb-3 px-2 font-medium">Status</th>
              <th className="pb-3 pl-4 text-right font-medium">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No courses on the platform yet.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="transition hover:bg-muted/50">
                  <td className="py-3.5 pr-4">
                    <p className="truncate text-sm text-foreground">{course.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {course.category} &middot; {course.level}
                    </p>
                  </td>

                  <td className="px-2 py-3.5 text-center text-sm text-foreground">{course.students}</td>

                  <td className="px-2 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${completionColor(course.completionRate)}`}
                          style={{ width: `${Math.min(course.completionRate, 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs text-muted-foreground">{course.completionRate}%</span>
                    </div>
                  </td>

                  <td className="px-2 py-3.5 text-center">
                    {course.avgRating > 0 ? (
                      <span className="inline-flex items-center gap-1 text-sm text-foreground">
                        <Star size={13} className="fill-warning text-warning" aria-hidden />
                        {course.avgRating}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No reviews</span>
                    )}
                  </td>

                  <td className="px-2 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[course.status] ?? "bg-muted-foreground"}`}
                        aria-hidden
                      />
                      {course.status}
                    </span>
                  </td>

                  <td className="py-3.5 pl-4 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-link hover:text-link-hover hover:underline"
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
    </section>
  );
}
