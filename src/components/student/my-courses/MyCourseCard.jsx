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

import { getDisplayUrl } from "@/lib/blob";

const STATUS_ACCENT = {
  Enrolled: "from-sky-300 via-sky-300/60 to-transparent",
  "In Progress": "from-amber-300 via-amber-300/60 to-transparent",
  Completed: "from-emerald-300 via-emerald-300/60 to-transparent",
};

const STATUS_STYLES = {
  Enrolled: { dot: "bg-sky-300", pill: "bg-sky-500/20 text-sky-50 border-white/30" },
  "In Progress": { dot: "bg-amber-300", pill: "bg-amber-500/20 text-amber-50 border-white/30" },
  Completed: { dot: "bg-emerald-300", pill: "bg-emerald-500/20 text-emerald-50 border-white/30" },
};

/**
 * Same cycled color palette as the instructor "My Courses" grid card
 * (CourseGridCard) so both roles share one visual language — kept as its
 * own copy since the two cards' data shapes (and future edits) diverge.
 */
const THEMES = [
  { gradient: "bg-gradient-to-br from-cyan-500 to-blue-700", viewText: "text-blue-800" },
  { gradient: "bg-gradient-to-br from-orange-500 to-red-700", viewText: "text-red-800" },
  { gradient: "bg-gradient-to-br from-amber-500 to-amber-700", viewText: "text-amber-900" },
  { gradient: "bg-gradient-to-br from-pink-500 to-pink-700", viewText: "text-pink-800" },
  { gradient: "bg-gradient-to-br from-violet-500 to-purple-700", viewText: "text-violet-900" },
  { gradient: "bg-gradient-to-br from-emerald-500 to-green-700", viewText: "text-green-900" },
  { gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700", viewText: "text-indigo-900" },
  { gradient: "bg-gradient-to-br from-teal-500 to-teal-700", viewText: "text-teal-900" },
  { gradient: "bg-gradient-to-br from-rose-500 to-rose-700", viewText: "text-rose-800" },
  { gradient: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-700", viewText: "text-fuchsia-900" },
  { gradient: "bg-gradient-to-br from-lime-600 to-green-700", viewText: "text-green-900" },
  { gradient: "bg-gradient-to-br from-sky-500 to-sky-700", viewText: "text-sky-900" },
];

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 md:gap-1 rounded-lg border border-white/25 bg-white/15 py-1 md:py-2 text-white backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Icon size={15} />
        <p className="text-sm md:text-base font-black tabular-nums">{value}</p>
      </div>
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
    </div>
  );
}

/** My Courses grid card for students — same bold gradient shell as the
 *  instructor CourseGridCard (banner, translucent stat pills, audit row,
 *  edit/view-style actions), driven by enrollment + progress data. */
export default function MyCourseCard({ enrollment, course: rawCourse, index = 0 }) {
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
  const statusStyle = isEnrolled ? STATUS_STYLES[status] : { dot: "bg-orange-400", pill: "bg-orange-500/20 text-orange-200 border-orange-500/30" };
  const accent = isEnrolled ? STATUS_ACCENT[status] : "from-orange-400 via-orange-400/60 to-transparent";
  const theme = THEMES[index % THEMES.length];

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
      className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 cursor-pointer border border-white/10"
    >
      {/* Dimmed color layer */}
      <div className={`absolute inset-0 ${theme.gradient} brightness-[0.6] contrast-[0.85]`} />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Banner */}
        <div className="relative h-28 md:h-32 shrink-0 overflow-hidden">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} z-10`} />
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
              <BookOpen size={36} className="text-white/20" />
            </div>
          )}

          <span className="absolute top-2 left-2 md:top-3 md:left-3 rounded-md border border-white/30 bg-white/15 backdrop-blur px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-bold text-white">
            {course.category || "General"}
          </span>

          <span
            className={`absolute top-2 right-2 md:top-3 md:right-3 inline-flex items-center gap-1.5 rounded-md border backdrop-blur px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-bold ${statusStyle.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {status}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 md:gap-2.5 p-3 md:p-4">
          <div>
            <h3 className="text-base md:text-lg font-black text-white leading-snug line-clamp-1">
              {course.title}
            </h3>
            {course.description ? (
              <p className="mt-0.5 md:mt-1 text-xs md:text-[13px] leading-relaxed text-white/80 line-clamp-2">
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
            <span className="flex min-w-0 items-center gap-1.5 truncate rounded-lg border border-white/25 bg-white/15 px-2 py-0.5 md:py-1 text-white backdrop-blur-sm">
              <UserRound size={13} className="shrink-0 text-white/70" />
              <span className="truncate">{instructorName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/25 bg-white/15 px-2 py-0.5 md:py-1 text-white backdrop-blur-sm">
              <Clock size={13} className="text-white/70" />
              {durationLabel}
            </span>
          </div>

          {isEnrolled ? (
            <>
              <div>
                <div className="flex items-center justify-between text-[10.5px] md:text-[11px] font-bold text-white/80 mb-1">
                  <span>Progress</span>
                  <span className="text-white">{progress}% Complete</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span className="flex items-center gap-1.5">
                  <History size={13} className="text-white/60" />
                  Last active: {lastAccessedLabel}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-xs text-white/90 pt-1">
              <span className="font-semibold text-white/80">Course Level</span>
              <span className="font-bold text-orange-300">{course.level || "All Levels"}</span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-1 md:pt-2">
            <button
              onClick={goTo(`/student/courses/${course.id}`)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs md:text-[13px] font-extrabold text-white transition hover:bg-white/20 cursor-pointer"
            >
              Details
              <ArrowUpRight size={13} />
            </button>
            <button
              onClick={goTo(isEnrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs md:text-[13px] font-extrabold transition hover:bg-white/90 active:scale-95 cursor-pointer ${theme.viewText}`}
            >
              <Play size={13} className="fill-current" />
              {isEnrolled ? (isComplete ? "Review" : "Continue") : "Enroll Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
