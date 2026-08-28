"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/shadcn/badge";
import { getDisplayUrl } from "@/lib/blob";

/** Not Started / Completed use a fixed neutral / green treatment; In Progress
 *  and Enrolled pull a solid accent color from ACCENT_PALETTE (deterministic
 *  per course) so active cards read with the same varied vividness as the
 *  reference design instead of all sharing one color. */
const NEUTRAL_STYLE = { badge: "bg-slate-500 text-white border-transparent", dot: "bg-white", fill: "bg-slate-400", button: "bg-slate-500 text-white" };
const COMPLETE_STYLE = { badge: "bg-emerald-500 text-white border-transparent", dot: "bg-white", fill: "bg-emerald-500", button: "bg-emerald-500 text-white" };

const ACCENT_PALETTE = [
  { badge: "bg-violet-500 text-white border-transparent", fill: "bg-violet-500", button: "bg-violet-500 text-white" },
  { badge: "bg-sky-500 text-white border-transparent", fill: "bg-sky-500", button: "bg-sky-500 text-white" },
  { badge: "bg-amber-500 text-white border-transparent", fill: "bg-amber-500", button: "bg-amber-500 text-white" },
  { badge: "bg-rose-500 text-white border-transparent", fill: "bg-rose-500", button: "bg-rose-500 text-white" },
  { badge: "bg-emerald-500 text-white border-transparent", fill: "bg-emerald-500", button: "bg-emerald-500 text-white" },
];

function hashIndex(id, mod) {
  const key = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(hash) % mod;
}

function getStatusStyle(status, courseId) {
  if (status === "Not Started") return NEUTRAL_STYLE;
  if (status === "Completed") return COMPLETE_STYLE;
  const accent = ACCENT_PALETTE[hashIndex(courseId, ACCENT_PALETTE.length)];
  return { ...accent, dot: "bg-white" };
}

/** Vivid gradient bank for the banner of courses with no thumbnailUrl, picked
 *  deterministically per course so the placeholder still has color instead of
 *  a flat gray box. */
const PLACEHOLDER_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-sky-500 to-blue-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-pink-700",
];

function placeholderGradient(id) {
  return PLACEHOLDER_GRADIENTS[hashIndex(id, PLACEHOLDER_GRADIENTS.length)];
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
  const style = getStatusStyle(status, course.id);

  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "Self-paced";

  const destination = isEnrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`;

  return (
    <div
      onClick={() => router.push(destination)}
      className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-card border border-card-border shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-36 md:h-40 shrink-0 overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getDisplayUrl(course.thumbnailUrl)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${placeholderGradient(course.id)}`}>
            <BookOpen size={40} className="text-white/50" />
          </div>
        )}

        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <Badge className={style.badge}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status}
          </Badge>
        </div>

        <span className="absolute top-3 right-3 md:top-4 md:right-4 text-sm font-extrabold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]">
          {progress}%
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4 md:p-5">
        <div>
          <h3 className="text-lg md:text-xl font-black text-foreground leading-snug line-clamp-1">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-1 text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${style.fill}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                {lessonsTotal} Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {durationLabel}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(destination);
              }}
              aria-label={isEnrolled ? (isComplete ? "Review course" : "Continue learning") : "View course"}
              className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full transition hover:brightness-110 active:scale-95 cursor-pointer ${style.button}`}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
