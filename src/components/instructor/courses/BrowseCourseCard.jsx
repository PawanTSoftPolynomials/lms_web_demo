"use client";

import Link from "next/link";
import { BookOpen, Clock, Users } from "lucide-react";

import { getDisplayUrl } from "@/lib/blob";

const LEVEL_STYLE = {
  Beginner: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  Advanced: "bg-rose-500/15 text-rose-700 border-rose-500/20",
};

/**
 * Read-only course card for the instructor's platform-wide "New Courses"
 * catalog (courses the instructor doesn't own). No edit/delete/export
 * actions — those mutate a course and are ownership-gated on the backend;
 * unlike CourseGridCard (My Courses), this card only links out to the
 * public course details page.
 */
export default function BrowseCourseCard({ course }) {
  const studentsCount = course._count?.enrollments ?? 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card-photo-jellyfish group relative flex w-[70%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-56 md:shrink flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card-photo-bg-from)] to-[var(--card-photo-bg-to)] border border-[var(--card-photo-border)] shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-28 md:h-32 shrink-0 pt-1.5 px-1.5 md:pt-2 md:px-2">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/20">
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getDisplayUrl(course.thumbnailUrl)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <BookOpen size={36} className="text-white/25" />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{ background: "linear-gradient(to bottom, transparent, var(--card-photo-bg-to))" }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 md:gap-1.5 p-2 md:p-2.5">
        <div>
          <h3 className="card-photo-title text-xs md:text-sm font-bold leading-snug line-clamp-1 text-[var(--card-photo-h1)]">
            {course.title}
          </h3>
          {course.creator?.name ? (
            <p className="mt-0.5 text-[10px] md:text-[11px] leading-relaxed line-clamp-1 text-[var(--card-photo-subtitle)]">
              by {course.creator.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] md:text-[10px] text-[var(--card-photo-subtitle)]">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {studentsCount} Students
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.estimatedLearningHours ? `${course.estimatedLearningHours}h` : "—"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span
            className="rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
            style={{ borderColor: "color-mix(in oklab, var(--card-photo-highlight) 35%, transparent)", backgroundColor: "color-mix(in oklab, var(--card-photo-highlight) 15%, transparent)", color: "var(--card-photo-h1)" }}
          >
            {course.category || "Uncategorized"}
          </span>
          {course.level ? (
            <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${LEVEL_STYLE[course.level] || LEVEL_STYLE.Beginner}`}>
              {course.level}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
