"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/shadcn/badge";
import { getDisplayUrl } from "@/lib/blob";

/** Status color is kept out of the card's 3-color hierarchy on purpose:
 *  Completed stays a universal success-green (a functional status signal,
 *  same reasoning as the app's own --success token) and Not Started stays
 *  neutral; every "active" state (Enrolled/In Progress) shares the card's
 *  one highlight color rather than a different hue per course. */
const NEUTRAL_STYLE = { badge: "bg-white/15 text-foreground/80 border-white/10", dot: "bg-white/70" };
const COMPLETE_STYLE = { badge: "bg-emerald-500 text-foreground border-transparent", dot: "bg-white" };

function getStatusStyle(status) {
  if (status === "Not Started") return NEUTRAL_STYLE;
  if (status === "Completed") return COMPLETE_STYLE;
  return { badge: "border-transparent", dot: "bg-black/40" };
}

/** My Courses grid card for students — banner image with a status pill and
 *  live percentage, title/description, a thin progress bar, and a lessons +
 *  duration footer row ending in a circular CTA button. */
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
      className="card-photo-jellyfish group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card-photo-bg-from)] to-[var(--card-photo-bg-to)] border border-[var(--card-photo-border)] shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-28 md:h-32 shrink-0 overflow-hidden">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getDisplayUrl(course.thumbnailUrl)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/20">
            <BookOpen size={32} className="text-foreground/25" />
          </div>
        )}

        {/* Blends the image's bottom edge into the card body's gradient
            color instead of a hard cutoff, echoing the soft-edged glow
            of the reference art. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{ background: "linear-gradient(to bottom, transparent, var(--card-photo-bg-to))" }}
        />

        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <Badge className={`text-[10px] px-1.5 py-0 ${style.badge}`} style={status !== "Not Started" && status !== "Completed" ? { backgroundColor: "var(--card-photo-highlight)", color: "#1a1200" } : undefined}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status}
          </Badge>
        </div>

        <span className="absolute top-2 right-2 md:top-3 md:right-3 text-xs font-extrabold text-foreground [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]">
          {progress}%
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3 md:p-4">
        <div>
          <h3 className="card-photo-title text-base md:text-lg font-semibold leading-snug line-clamp-1 text-[var(--card-photo-h1)]">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-0.5 text-[10px] md:text-xs leading-relaxed line-clamp-1 text-[var(--card-photo-subtitle)]">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: status === "Completed" ? "#10b981" : "var(--card-photo-highlight)" }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-xs text-foreground/50">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {lessonsTotal}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {durationLabel}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(destination);
              }}
              aria-label={isEnrolled ? (isComplete ? "Review course" : "Continue learning") : "View course"}
              className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full transition hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: "var(--card-photo-highlight)", color: "#1a1200" }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
