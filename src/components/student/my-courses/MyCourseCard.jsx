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
  Play,
} from "lucide-react";

import { StatCell } from "@/components/student/courses/CourseCard";
import ProgressBar from "@/components/student/courses/ProgressBar";

const STATUS_STYLES = {
  Enrolled: { dot: "bg-sky-400", pill: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  "In Progress": { dot: "bg-amber-400", pill: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  Completed: { dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
};

/** The "My Courses" grid card for students — same visual language as the
 *  Browse Courses CourseCard (thumbnail, badges, stat grid, progress,
 *  Continue Learning/Course Details), driven by enrollment data instead of
 *  the catalog course shape. */
export default function MyCourseCard({ enrollment }) {
  const { course } = enrollment;

  if (!course) return null;

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
  // heuristic (0.75 hr/lesson), same as CourseCard.
  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "Self-paced";

  const lastAccessedAt = enrollment.lastAccessedAt || enrollment.enrolledAt;
  const lastAccessedLabel = lastAccessedAt
    ? formatDistanceToNow(new Date(lastAccessedAt), { addSuffix: true })
    : "Never";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_45px_-20px_rgba(249,115,22,0.25)]">
      {/* Thumbnail */}
      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-900">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/20">
            <BookOpen size={28} className="text-slate-700" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

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
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <h3
            className="text-[15px] font-bold text-white leading-snug line-clamp-2 min-h-[2.6em]"
            title={course.title}
          >
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.2em]">
            {course.description || "No description provided yet."}
          </p>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="grid flex-1 grid-cols-3 divide-x divide-card-border overflow-hidden rounded-xl border border-card-border bg-white/[0.02]">
            <StatCell icon={Layers} value={`${completedModules}/${modulesTotal}`} label="Modules" />
            <StatCell icon={BookOpen} value={`${completedLessons}/${lessonsTotal}`} label="Lessons" />
            <StatCell icon={ClipboardCheck} value={`${completedQuizzes}/${quizzesTotal}`} label="Quizzes" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-card-border bg-white/[0.02] px-3 text-[11px] font-bold text-slate-300">
            <Clock size={12} className="text-slate-500" />
            {durationLabel}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-slate-400">Progress</span>
            <span className="text-orange-400">{progress}% Complete</span>
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>

        <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <User size={12} className="shrink-0" /> <span className="truncate">{instructorName}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <History size={12} /> {lastAccessedLabel}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/student/courses/${course.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-card-border bg-white/[0.03] py-2 text-xs font-bold text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200"
          >
            Course Details
          </Link>
          <Link
            href={`/student/learn/${course.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2 text-xs font-bold text-slate-950 hover:bg-orange-600 transition-all duration-200"
          >
            <Play size={13} className="fill-slate-950" />
            {isComplete ? "Review Course" : "Continue Learning"}
          </Link>
        </div>
      </div>
    </div>
  );
}
