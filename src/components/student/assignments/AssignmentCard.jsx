import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronRight, Hourglass, Quote } from "lucide-react";

import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

const formatDate = (value) =>
  new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

// Each course gets its own colour for the tile's top band, so a student can
// tell courses apart at a glance. Green, amber and red are left out on
// purpose — those colours mean status (graded, being graded, overdue).
const COURSE_TONES = [
  { band: "bg-sky-500", dot: "bg-sky-500" },
  { band: "bg-violet-500", dot: "bg-violet-500" },
  { band: "bg-rose-400", dot: "bg-rose-400" },
  { band: "bg-teal-400", dot: "bg-teal-400" },
  { band: "bg-indigo-500", dot: "bg-indigo-500" },
  { band: "bg-fuchsia-500", dot: "bg-fuchsia-500" },
];

function courseTone(key = "") {
  let hash = 0;
  for (const ch of String(key)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COURSE_TONES[hash % COURSE_TONES.length];
}

/**
 * How far round the score ring fills. Only a grade that states its own scale
 * ("9/10", "90%") can be drawn proportionally; anything else ("9", "A+")
 * gets a full ring rather than a guessed fraction.
 */
function gradeFraction(grade) {
  const ratio = grade.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
  if (ratio && Number(ratio[2]) > 0) return Math.min(Number(ratio[1]) / Number(ratio[2]), 1);
  const percent = grade.match(/^\s*(\d+(?:\.\d+)?)\s*%\s*$/);
  if (percent) return Math.min(Number(percent[1]) / 100, 1);
  return null;
}

/** The grade as a score ring — the one bold element on each graded tile. */
function GradeSeal({ grade }) {
  // Word grades ("Excellent") don't fit a ring; they get a plain badge.
  if (grade.length > 5) {
    return (
      <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-sm font-bold text-emerald-500">
        {grade}
      </span>
    );
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const filled = gradeFraction(grade) ?? 1;

  return (
    <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`Grade ${grade}`}>
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="4.5" className="stroke-emerald-500/20" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className="stroke-emerald-500"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold text-emerald-500 tabular-nums ${
          grade.length <= 2 ? "text-lg" : "text-xs"
        }`}
      >
        {grade}
      </span>
    </div>
  );
}

/** A calendar leaf for the due date, so the next deadline reads at a glance. */
function DueLeaf({ dueDate, overdue }) {
  const date = new Date(dueDate);
  return (
    <div
      aria-hidden
      className={`flex h-14 w-12 shrink-0 flex-col overflow-hidden rounded-lg border bg-card text-center ${
        overdue ? "border-red-500/40" : "border-border"
      }`}
    >
      <span
        className={`py-0.5 text-[10px] font-semibold ${
          overdue ? "bg-red-500/15 text-red-500" : "bg-primary/15 text-primary"
        }`}
      >
        {date.toLocaleDateString([], { month: "short" })}
      </span>
      <span className="flex flex-1 items-center justify-center text-lg font-bold text-foreground tabular-nums">
        {date.getDate()}
      </span>
    </div>
  );
}

/** Round icon used in the status panel when there's no grade or date to show. */
function StatusIcon({ icon: Icon, className }) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${className}`}>
      <Icon size={20} aria-hidden />
    </span>
  );
}

/**
 * One assignment as a tile on the student's Assignments page. The whole tile
 * opens it. The top band is the course's colour; the tinted panel says where
 * the work stands — a due date while it's to do, an hourglass while it's
 * being graded, and the grade once it's back, with the instructor's feedback
 * quoted beneath.
 */
export default function AssignmentCard({ assignment }) {
  const { id, title, course, dueDate, submittedAt, grade, feedback } = assignment;
  const status = normalizeAssignmentStatus(assignment);
  const courseName = course?.title ?? assignment.courseTitle ?? "Course";
  const tone = courseTone(course?.id || courseName);

  // A lesson-composer Assignment (kind "content") lives inside the course
  // player, not at /student/assignments/:id — open its lesson there.
  const href =
    assignment.kind === "content"
      ? `/student/learn/${course?.id}${assignment.lessonId ? `?lessonId=${assignment.lessonId}` : ""}`
      : `/student/assignments/${id}`;

  const isTodo = status === "Not Submitted" || status === "In Progress";
  const isGraded = status === "Graded";
  const isOverdue = isTodo && Boolean(dueDate) && new Date(dueDate) < new Date();
  const submittedText = submittedAt ? `Submitted ${formatDate(submittedAt)}` : null;

  let panel;
  if (isGraded) {
    panel = {
      className: "border-emerald-500/20 bg-emerald-500/5",
      visual: grade ? (
        <GradeSeal grade={grade} />
      ) : (
        <StatusIcon icon={CheckCircle2} className="bg-emerald-500/15 text-emerald-500" />
      ),
      label: "Graded",
      labelClass: "text-emerald-500",
      detail: submittedText,
    };
  } else if (isTodo) {
    panel = {
      className: isOverdue ? "border-red-500/25 bg-red-500/5" : "border-primary/20 bg-primary/5",
      visual: dueDate ? (
        <DueLeaf dueDate={dueDate} overdue={isOverdue} />
      ) : (
        <StatusIcon icon={CalendarDays} className="bg-primary/15 text-primary" />
      ),
      label: isOverdue ? "Overdue" : "Not submitted yet",
      labelClass: isOverdue ? "text-red-500" : "text-primary",
      detail: dueDate ? `${isOverdue ? "Was due" : "Due"} ${formatDate(dueDate)}` : "No due date",
    };
  } else {
    panel = {
      className: "border-amber-500/20 bg-amber-500/5",
      visual: <StatusIcon icon={Hourglass} className="bg-amber-500/15 text-amber-500" />,
      label: "Being graded",
      labelClass: "text-amber-500",
      detail: submittedText,
    };
  }

  const actionLabel = isTodo ? "Open assignment" : "View submission";

  return (
    <Link
      href={href}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden className={`h-1.5 w-full shrink-0 ${tone.band}`} />

      <div className="flex flex-1 flex-col p-5">
        <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
          <span className="truncate">{courseName}</span>
        </p>

        <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
          {title || "Assignment"}
        </h3>

        <div className={`mt-4 flex items-center gap-3 rounded-xl border p-3 ${panel.className}`}>
          {panel.visual}
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${panel.labelClass}`}>{panel.label}</p>
            {panel.detail && <p className="mt-0.5 text-xs text-muted-foreground">{panel.detail}</p>}
          </div>
        </div>

        {feedback && (
          <figure className="mt-4">
            <blockquote className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Quote size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden />
              <p className="min-w-0 whitespace-pre-wrap break-words line-clamp-3">{feedback}</p>
            </blockquote>
            <figcaption className="mt-1 pl-6 text-xs text-muted-foreground">Your instructor</figcaption>
          </figure>
        )}
      </div>

      <div
        className={`flex items-center justify-between border-t border-border px-5 py-3 text-sm font-semibold transition-colors group-hover:text-primary ${
          isTodo ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {actionLabel}
        <ChevronRight size={16} aria-hidden />
      </div>
    </Link>
  );
}
