"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, UserCog, Layers } from "lucide-react";

/**
 * The four platform numbers worth scanning, each a link to the screen it
 * summarises.
 *
 * Whole tiles are anchors now: the bordered, hoverable box does what its
 * affordance promises instead of hiding a small "View ->" inside a box that
 * looked clickable in its entirety.
 *
 * "Total Users" is gone as a fifth tile — it is students + instructors + admins,
 * so it restated two tiles sitting beside it and had no screen of its own to
 * link to. The delta lines ("+3 today") stay, since a count plus its movement
 * is the one thing a platform overview should say.
 */
export function AdminKPIs({
  coursesCount = 0,
  studentsCount = 0,
  instructorsCount = 0,
  enrollmentsCount = 0,
  trends = {},
}) {
  const {
    newCoursesThisMonth = 0,
    newStudentsToday = 0,
    newEnrollmentsToday = 0,
  } = trends;

  const kpis = [
    {
      label: "Courses",
      value: coursesCount,
      icon: BookOpen,
      href: "/admin/courses",
      caption: newCoursesThisMonth > 0 ? `+${newCoursesThisMonth} this month` : "Across all instructors",
    },
    {
      label: "Students",
      value: studentsCount,
      icon: GraduationCap,
      href: "/admin/students",
      caption: newStudentsToday > 0 ? `+${newStudentsToday} today` : "Registered learners",
    },
    {
      label: "Instructors",
      value: instructorsCount,
      icon: UserCog,
      href: "/admin/instructors",
      caption: "Authoring courses",
    },
    {
      label: "Enrollments",
      value: enrollmentsCount,
      icon: Layers,
      href: "/admin/enrollments",
      caption: newEnrollmentsToday > 0 ? `+${newEnrollmentsToday} today` : "Total across the platform",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Link
          key={kpi.label}
          href={kpi.href}
          className="group rounded-2xl border border-card-border bg-card p-4 transition hover:border-link/40 hover:bg-muted/40"
        >
          <div className="flex items-center gap-2">
            <kpi.icon size={15} className="shrink-0 text-muted-foreground" aria-hidden />
            <p className="truncate text-xs font-medium text-muted-foreground">{kpi.label}</p>
          </div>

          <p className="mt-2 text-2xl font-semibold leading-none tracking-tight text-foreground">
            {kpi.value}
          </p>

          {/* Wraps rather than truncates — a tile is ~170px wide in the
              two-column mobile grid. */}
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground group-hover:text-link">
            {kpi.caption}
          </p>
        </Link>
      ))}
    </div>
  );
}
