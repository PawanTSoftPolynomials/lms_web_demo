"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Layers,
  ClipboardCheck,
  Clock,
  UserRound,
  History,
  Play,
  ArrowUpRight,
} from "lucide-react";

import { Badge } from "@/components/ui/shadcn/badge";
import { getDisplayUrl } from "@/lib/blob";

const ACCENT_BAR = {
  Enrolled: "bg-muted-foreground/40",
  "In Progress": "bg-warning",
  Completed: "bg-success",
};

const STATUS_BADGE_VARIANT = {
  Enrolled: "info",
  "In Progress": "warning",
  Completed: "success",
};

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 md:gap-1 rounded-lg border border-border bg-muted/60 py-1 md:py-2 text-foreground">
      <div className="flex items-center gap-1.5">
        <Icon size={15} className="text-primary" />
        <p className="text-sm md:text-base font-black tabular-nums">{value}</p>
      </div>
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

/** My Courses grid card for students — same card shell as the instructor
 *  CourseGridCard (banner, stat pills, audit row, edit/view-style actions),
 *  driven by enrollment + progress data. */
export default function MyCourseCard({ enrollment, course: rawCourse }) {
  const router = useRouter();
  const course = enrollment?.course || rawCourse;

  if (!course) return null;

  const isEnrolled = Boolean(enrollment);

  const modulesTotal = Array.isArray(course.modules) ? course.modules.length : (course._count?.modules ?? 0);
  const lessonsTotal = Array.isArray(course.modules)
    ? course.modules.reduce((acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
    : (course.stats?.lessonsCount ?? course.lessons ?? course._count?.lessons ?? 0);
  const quizzesTotal = Array.isArray(course.quizzes) ? course.quizzes.length : (course._count?.quizzes ?? 0);

  const progress = Math.min(100, Math.max(0, Math.round(enrollment?.progress ?? 0)));
  const completedLessons = Math.min(lessonsTotal, enrollment?.completedLessons ?? 0);

  const completionRatio = lessonsTotal > 0 ? completedLessons / lessonsTotal : progress / 100;
  const completedModules = modulesTotal > 0 ? Math.min(modulesTotal, Math.round(completionRatio * modulesTotal)) : 0;
  const completedQuizzes = quizzesTotal > 0 ? Math.min(quizzesTotal, Math.round(completionRatio * quizzesTotal)) : 0;

  const isComplete = isEnrolled && progress >= 100;
  const status = isEnrolled ? (isComplete ? "Completed" : progress > 0 ? "In Progress" : "Enrolled") : (course.level || "Available");
  const accentBar = isEnrolled ? ACCENT_BAR[status] : "bg-primary";

  const instructorName = course.creator?.name ?? course.instructor ?? "Instructor";

  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "Self-paced";

  const lastAccessedAt = enrollment?.lastAccessedAt || enrollment?.enrolledAt;
  const lastAccessedLabel = lastAccessedAt
    ? formatDistanceToNow(new Date(lastAccessedAt), { addSuffix: true })
    : "Never";

  const goTo = (path) => (e) => {
    e.stopPropagation();
    router.push(path);
  };

  return (
    <div
      onClick={() => router.push(isEnrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`)}
      className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-card border border-card-border shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-28 md:h-32 shrink-0 overflow-hidden bg-muted">
        <div className={`absolute inset-x-0 top-0 h-1 ${accentBar} z-10`} />
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
            <BookOpen size={36} className="text-muted-foreground/40" />
          </div>
        )}

        <span className="absolute top-2 left-2 md:top-3 md:left-3 rounded-md border border-white/30 bg-black/50 backdrop-blur px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-bold text-white">
          {course.category || "General"}
        </span>

        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          {isEnrolled ? (
            <Badge variant={STATUS_BADGE_VARIANT[status]}>{status}</Badge>
          ) : (
            <Badge variant="secondary">{status}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 md:gap-2.5 p-3 md:p-4">
        <div>
          <h3 className="text-base md:text-lg font-black text-foreground leading-snug line-clamp-1">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-0.5 md:mt-1 text-xs md:text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          <Stat icon={Layers} value={isEnrolled ? `${completedModules}/${modulesTotal}` : modulesTotal} label="Modules" />
          <Stat icon={BookOpen} value={isEnrolled ? `${completedLessons}/${lessonsTotal}` : lessonsTotal} label="Lessons" />
          <Stat icon={ClipboardCheck} value={isEnrolled ? `${completedQuizzes}/${quizzesTotal}` : quizzesTotal} label="Quizzes" />
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
          <span className="flex min-w-0 items-center gap-1.5 truncate rounded-lg border border-border bg-muted/60 px-2 py-0.5 md:py-1 text-foreground">
            <UserRound size={13} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{instructorName}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2 py-0.5 md:py-1 text-foreground">
            <Clock size={13} className="text-muted-foreground" />
            {durationLabel}
          </span>
        </div>

        {isEnrolled ? (
          <>
            <div>
              <div className="flex items-center justify-between text-[10.5px] md:text-[11px] font-bold text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="text-foreground">{progress}% Complete</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <History size={13} />
                Last active: {lastAccessedLabel}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-muted-foreground">Course Level</span>
            <span className="font-bold text-primary">{course.level || "All Levels"}</span>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1 md:pt-2">
          <button
            onClick={goTo(`/student/courses/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs md:text-[13px] font-extrabold text-foreground transition hover:bg-muted cursor-pointer"
          >
            Details
            <ArrowUpRight size={13} />
          </button>
          <button
            onClick={goTo(isEnrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs md:text-[13px] font-extrabold transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Play size={13} className="fill-current" />
            {isEnrolled ? (isComplete ? "Review" : "Continue") : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
