"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardCheck, HelpCircle } from "lucide-react";

/**
 * The four numbers worth scanning, each a link to the screen it summarises.
 *
 * Every tile navigates, so the whole tile is the anchor: the bordered, hoverable
 * box now actually does the thing its affordance promises, instead of hiding a
 * small "View ->" link inside a box that looked clickable in its entirety.
 *
 * "Average class engagement" used to sit here as a fifth tile. It was rendering
 * `avg(lessonsCompleted per day)` with a "%" appended — a raw count formatted as
 * a percentage — and it cost a whole extra request (GET /dashboard/instructor)
 * to produce. Per-course engagement lives in Analytics, where it can be shown
 * against a denominator that makes it mean something.
 */
export function InstructorKPIs({
  coursesCount = 0,
  studentsCount = 0,
  pendingAssignments = 0,
  activeQuizzes = 0,
}: {
  coursesCount?: number;
  studentsCount?: number;
  pendingAssignments?: number;
  activeQuizzes?: number;
}) {
  const kpis = [
    {
      label: "My courses",
      value: coursesCount,
      icon: BookOpen,
      caption: "Draft, published & archived",
      href: "/instructor/courses",
    },
    {
      label: "Students",
      value: studentsCount,
      icon: Users,
      caption: "Enrolled across all courses",
      href: "/instructor/students",
    },
    {
      label: "To review",
      value: pendingAssignments,
      icon: ClipboardCheck,
      caption: "Submissions awaiting a grade",
      href: "/instructor/assignments",
    },
    {
      label: "Active quizzes",
      value: activeQuizzes,
      icon: HelpCircle,
      caption: "Published and open to students",
      href: "/instructor/quizzes",
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

          {/* Wraps rather than truncates: in the 2-column mobile grid a tile is
              ~170px wide, and "Submissions awaiting a grade" clipped to one
              line reads as "Submissions awaiting a...". */}
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground group-hover:text-link">
            {kpi.caption}
          </p>
        </Link>
      ))}
    </div>
  );
}
