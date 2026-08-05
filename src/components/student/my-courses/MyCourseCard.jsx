"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Layers,
  ClipboardCheck,
  Clock,
  User,
  History,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

const STATUS_STYLES = {
  Enrolled: { dot: "bg-sky-400", pill: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  "In Progress": { dot: "bg-amber-400", pill: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  Completed: { dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
};

// Each course gets a vibrant accent gradient (there's no per-course color in
// the data model) so cards read as distinct, colorful identities — cycled
// by position, same palette family as the instructor grid card.
const CARD_ACCENTS = [
  { gradient: "from-[#1c5a8a] via-[#164a72] to-[#0e2c46]", text: "text-[#1c5a8a]" }, // blue
  { gradient: "from-[#a8531f] via-[#8a3f16] to-[#4a2410]", text: "text-[#a8531f]" }, // rust/orange
  { gradient: "from-[#a8791f] via-[#8a5f16] to-[#4a3610]", text: "text-[#a8791f]" }, // gold/brown
  { gradient: "from-[#8a2a63] via-[#6f2050] to-[#3a1230]", text: "text-[#8a2a63]" }, // magenta/purple
];

function StatCell({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-lg bg-white/10 border border-white/15">
      <Icon size={13} className="text-white/70" />
      <span className="text-[13px] font-black text-white leading-none tabular-nums">{value}</span>
      <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );
}

/** The "My Courses" grid card for students — thumbnail, learning-status
 *  badge, progress stats, Continue Learning/Course Details. */
export default function MyCourseCard({ enrollment, index = 0 }) {
  const { course } = enrollment;

  if (!course) return null;

  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const modulesTotal = course._count?.modules ?? 0;
  const lessonsTotal = course.stats?.lessonsCount ?? course.lessons ?? 0;
  const quizzesTotal = course._count?.quizzes ?? 0;

  const progress = Math.min(100, Math.max(0, Math.round(enrollment.progress ?? 0)));
  const completedLessons = Math.min(lessonsTotal, enrollment.completedLessons ?? 0);

  // No per-module/quiz completion tracking on the backend — approximate from
  // the lesson-completion ratio.
  const completionRatio = lessonsTotal > 0 ? completedLessons / lessonsTotal : progress / 100;
  const completedModules = modulesTotal > 0 ? Math.min(modulesTotal, Math.round(completionRatio * modulesTotal)) : 0;
  const completedQuizzes = quizzesTotal > 0 ? Math.min(quizzesTotal, Math.round(completionRatio * quizzesTotal)) : 0;

  const isComplete = progress >= 100;
  const status = isComplete ? "Completed" : progress > 0 ? "In Progress" : "Enrolled";
  const statusStyle = STATUS_STYLES[status];

  const instructorName = course.creator?.name ?? course.instructor ?? "Instructor";

  // Prefer the course's own estimated hours; fall back to a lesson-count
  // heuristic (0.75 hr/lesson).
  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "—";

  const lastAccessedAt = enrollment.lastAccessedAt || enrollment.enrolledAt;
  const lastAccessedLabel = lastAccessedAt
    ? formatDistanceToNow(new Date(lastAccessedAt), { addSuffix: true })
    : "Never";

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b ${accent.gradient} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:brightness-110`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black/20">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
            <BookOpen size={28} className="text-white/50" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />

        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
          {course.category || "General"}
        </span>

        <span
          className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${statusStyle.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3
            className="text-[15px] font-bold text-white leading-snug line-clamp-2 min-h-[2.6em]"
            title={course.title}
          >
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-white/80 leading-relaxed line-clamp-2 min-h-[2.2em]">
            {course.description || "No description provided yet."}
          </p>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            <StatCell icon={Layers} value={`${completedModules}/${modulesTotal}`} label="Modules" />
            <StatCell icon={BookOpen} value={`${completedLessons}/${lessonsTotal}`} label="Lessons" />
            <StatCell icon={ClipboardCheck} value={`${completedQuizzes}/${quizzesTotal}`} label="Quizzes" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-[11px] font-bold text-white">
            <Clock size={12} className="text-white/70" />
            {durationLabel}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] font-medium text-white/80">
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <User size={12} className="shrink-0" /> <span className="truncate">{instructorName}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <History size={12} /> {lastAccessedLabel}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/student/learn/${course.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all duration-200"
          >
            <GraduationCap size={13} /> Continue Learning
          </Link>
          <Link
            href={`/student/courses/${course.id}`}
            className={`flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold ${accent.text} hover:bg-slate-100 transition-all duration-200`}
          >
            Course Details <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
