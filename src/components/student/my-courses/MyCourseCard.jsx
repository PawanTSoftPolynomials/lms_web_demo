"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock, ArrowUpRight } from "lucide-react";

import { getDisplayUrl } from "@/lib/blob";

/** Status color is kept out of the card's 3-color hierarchy on purpose:
 *  Completed stays a universal success-green (a functional status signal,
 *  same reasoning as the app's own --success token) and Not Started stays
 *  neutral; every "active" state (Enrolled/In Progress) shares the card's
 *  one highlight color rather than a different hue per course. */
const NEUTRAL_STYLE = { dot: "bg-white/70" };
const COMPLETE_STYLE = { dot: "bg-emerald-400" };

function getStatusStyle(status) {
  if (status === "Not Started") return NEUTRAL_STYLE;
  if (status === "Completed") return COMPLETE_STYLE;
  return { dot: "bg-[var(--card-photo-highlight)]" };
}

/** My Courses grid card for students — same compact footprint/density as the
 *  Instructor My Courses grid (CourseGridCard): small inset banner, a status
 *  pill + live percentage, one-line title/description, and a thin progress
 *  bar in place of Instructor's Edit/View action row. */
export default function MyCourseCard({ enrollment, course: rawCourse }) {
  const router = useRouter();
  const course = enrollment?.course || rawCourse;

  if (!course) return null;

  const isEnrolled = Boolean(enrollment);

  const lessonsTotal = Array.isArray(course.modules)
    ? course.modules.reduce((acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
    : (course.stats?.lessonsCount ?? course.lessons ?? course._count?.lessons ?? 0);

  const progress = Math.min(100, Math.max(0, Math.round(enrollment?.progress ?? 0)));
  const isComplete = isEnrolled && progress >= 100;
  const status = isEnrolled ? (isComplete ? "Completed" : progress > 0 ? "In Progress" : "Enrolled") : "Not Started";
  const style = getStatusStyle(status);

  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "Self-paced";

  const destination = isEnrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`;

  return (
    <div
      onClick={() => router.push(destination)}
      className="card-photo-jellyfish group relative flex w-full h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card-photo-bg-from)] to-[var(--card-photo-bg-to)] border border-[var(--card-photo-border)] shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
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

          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/55 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-white">
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status}
          </span>

          <span className="absolute top-1.5 right-1.5 rounded-md bg-black/55 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-white">
            {progress}%
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 md:gap-1.5 p-2 md:p-2.5">
        <div>
          <h3 className="card-photo-title text-xs md:text-sm font-bold leading-snug line-clamp-1 text-[var(--card-photo-h1)]">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-0.5 text-[10px] md:text-[11px] leading-relaxed line-clamp-1 text-[var(--card-photo-subtitle)]">{course.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] md:text-[10px] text-[var(--card-photo-subtitle)]">
          <span className="flex items-center gap-1">
            <BookOpen size={11} />
            {lessonsTotal} Lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {durationLabel}
          </span>
        </div>

        <div className="mt-auto space-y-1 pt-0.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: status === "Completed" ? "#10b981" : "var(--card-photo-highlight)" }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(destination);
            }}
            className="w-full inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] md:text-[11px] font-extrabold transition hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--card-photo-highlight)", color: "#1a1200" }}
          >
            {isEnrolled ? (isComplete ? "Review Course" : "Continue Learning") : "View Course"}
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
