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
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";

import ProgressBar from "./ProgressBar";

const LEARNING_STATUS_STYLES = {
  Enrolled: { dot: "bg-sky-400", pill: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  "In Progress": { dot: "bg-amber-400", pill: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  Completed: { dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
};

export function StatCell({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2.5 px-1.5">
      <Icon size={13} className="text-slate-500" />
      <span className="text-[13px] font-black text-white leading-none tabular-nums">{value}</span>
      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

/** The Student "Browse Courses" grid card — same shell as the instructor
 *  CourseGridCard (thumbnail, badges, stat grid, buttons), with the
 *  student's own learning progress standing in for instructor management info. */
export default function CourseCard({ course, enrollment }) {
  const isEnrolled = Boolean(enrollment);
  // The enrollments endpoint only returns a thin course object (id/title/
  // description) — layer it under the richer catalog `course` prop (which
  // has thumbnail/category/modules/stats) instead of replacing it outright.
  const courseData = isEnrolled ? { ...enrollment?.course, ...course } : course;

  if (!courseData) return null;

  const {
    id,
    title,
    description,
    thumbnailUrl,
    category = "General",
    instructor,
    creator,
    modules,
    quizzes,
    _count,
  } = courseData;

  const instructorName = instructor ?? creator?.name ?? "Instructor";

  const modulesTotal = Array.isArray(modules) ? modules.length : (_count?.modules ?? 0);
  const lessonsTotal = Array.isArray(modules)
    ? modules.reduce((acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
    : (courseData.lessons ?? _count?.lessons ?? 0);
  const quizzesTotal = Array.isArray(quizzes) ? quizzes.length : (_count?.quizzes ?? 0);

  const progress = Math.min(100, Math.max(0, Math.round(enrollment?.progress ?? 0)));
  const completedLessons = Math.min(lessonsTotal, enrollment?.completedLessons ?? 0);

  // No per-module/quiz completion tracking on the backend — approximate from
  // the lesson-completion ratio (falls back to overall progress when lesson
  // totals aren't available yet).
  const completionRatio = lessonsTotal > 0 ? completedLessons / lessonsTotal : progress / 100;
  const completedModules = modulesTotal > 0 ? Math.min(modulesTotal, Math.round(completionRatio * modulesTotal)) : 0;
  const completedQuizzes = quizzesTotal > 0 ? Math.min(quizzesTotal, Math.round(completionRatio * quizzesTotal)) : 0;

  const isComplete = isEnrolled && progress >= 100;
  const learningStatus = !isEnrolled ? null : isComplete ? "Completed" : progress > 0 ? "In Progress" : "Enrolled";
  const statusStyle = learningStatus ? LEARNING_STATUS_STYLES[learningStatus] : null;

  // Prefer the course's own estimated hours; fall back to a lesson-count
  // heuristic (0.75 hr/lesson), same as the instructor card.
  const estimatedHours =
    courseData.estimatedLearningHours ?? (lessonsTotal > 0 ? Math.max(1, Math.round(lessonsTotal * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "Self-paced";

  const lastAccessedAt = enrollment?.lastAccessedAt || enrollment?.updatedAt || enrollment?.enrolledAt;
  const lastAccessedLabel = lastAccessedAt
    ? formatDistanceToNow(new Date(lastAccessedAt), { addSuffix: true })
    : "Never";

  const primaryLabel = !isEnrolled ? "View Course" : isComplete ? "Review Course" : "Continue Learning";
  const primaryHref = isEnrolled ? `/student/learn/${id}` : `/student/courses/${id}`;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_45px_-20px_rgba(249,115,22,0.25)]">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
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
          {category}
        </span>

        {statusStyle && (
          <span
            className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${statusStyle.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {learningStatus}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3
            className="text-[15px] font-bold text-white leading-snug line-clamp-2 min-h-[2.6em]"
            title={title}
          >
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.2em]">
            {description || "No description provided yet."}
          </p>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="grid flex-1 grid-cols-3 divide-x divide-card-border overflow-hidden rounded-xl border border-card-border bg-white/[0.02]">
            <StatCell
              icon={Layers}
              value={isEnrolled ? `${completedModules}/${modulesTotal}` : modulesTotal}
              label="Modules"
            />
            <StatCell
              icon={BookOpen}
              value={isEnrolled ? `${completedLessons}/${lessonsTotal}` : lessonsTotal}
              label="Lessons"
            />
            <StatCell
              icon={ClipboardCheck}
              value={isEnrolled ? `${completedQuizzes}/${quizzesTotal}` : quizzesTotal}
              label="Quizzes"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-card-border bg-white/[0.02] px-3 text-[11px] font-bold text-slate-300">
            <Clock size={12} className="text-slate-500" />
            {durationLabel}
          </div>
        </div>

        {isEnrolled && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-slate-400">Progress</span>
              <span className="text-orange-400">{progress}% Complete</span>
            </div>
            <ProgressBar value={progress} size="sm" />
          </div>
        )}

        <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <User size={12} className="shrink-0" /> <span className="truncate">{instructorName}</span>
          </span>
          {isEnrolled ? (
            <span className="flex items-center gap-1.5 shrink-0">
              <History size={12} /> {lastAccessedLabel}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 shrink-0">
              <GraduationCap size={12} /> {courseData.level || "All levels"}
            </span>
          )}
        </div>

        <div className={`mt-auto grid gap-2 pt-1 ${isEnrolled ? "grid-cols-2" : "grid-cols-1"}`}>
          {isEnrolled && (
            <Link
              href={`/student/courses/${id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-card-border bg-white/[0.03] py-2.5 text-xs font-bold text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200"
            >
              Course Details
            </Link>
          )}
          <Link
            href={primaryHref}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-orange-600 transition-all duration-200"
          >
            {isEnrolled && <Play size={13} className="fill-slate-950" />}
            {primaryLabel}
            {!isEnrolled && <ArrowUpRight size={13} />}
          </Link>
        </div>
      </div>
    </div>
  );
}
