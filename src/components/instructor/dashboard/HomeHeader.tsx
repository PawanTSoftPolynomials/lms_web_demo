"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * The greeting row at the top of Instructor Home.
 *
 * Carries three things and nothing else: who you are, what today looks like in
 * one sentence, and the one action an instructor starts most often. The summary
 * line is plain prose rather than another row of tiles — the KPI strip below it
 * already covers the scannable numbers, and repeating them as a sentence is how
 * the page says "here is your day" instead of "here is your data".
 */

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** "3 to review · 2 drafts · 41 students" — only the parts that are non-zero. */
function summaryParts({
  pendingReviews,
  draftCourses,
  studentsCount,
}: {
  pendingReviews: number;
  draftCourses: number;
  studentsCount: number;
}) {
  const parts: string[] = [];
  if (pendingReviews > 0) parts.push(`${pendingReviews} to review`);
  if (draftCourses > 0) parts.push(`${draftCourses} draft${draftCourses === 1 ? "" : "s"}`);
  if (studentsCount > 0) parts.push(`${studentsCount} student${studentsCount === 1 ? "" : "s"}`);
  return parts;
}

export function HomeHeader({
  instructorName,
  pendingReviews = 0,
  draftCourses = 0,
  studentsCount = 0,
}: {
  instructorName?: string;
  pendingReviews?: number;
  draftCourses?: number;
  studentsCount?: number;
}) {
  const now = new Date();
  const firstName = instructorName?.trim().split(/\s+/)[0];

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const parts = summaryParts({ pendingReviews, draftCourses, studentsCount });

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greetingFor(now)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dateLabel}
          {parts.length > 0 && ` · ${parts.join(" · ")}`}
        </p>
      </div>

      {/* Navigation, not an action — this goes to the create-course screen
          rather than creating anything, so it is an anchor in link colour. */}
      <Link
        href="/instructor/courses/create"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-link transition hover:border-link/40 hover:bg-muted"
      >
        <Plus size={16} aria-hidden />
        New course
      </Link>
    </header>
  );
}
