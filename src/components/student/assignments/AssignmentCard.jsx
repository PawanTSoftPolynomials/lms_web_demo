import Link from "next/link";
import { CalendarDays, Clock, BookOpen, FileText } from "lucide-react";

import Button from "@/components/ui/Button";
import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

const statusStyles = {
  "Not Submitted": "bg-red-500/10 text-red-200 border border-red-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-200 border border-yellow-500/20",
  Submitted: "bg-blue-500/10 text-blue-200 border border-blue-500/20",
  Graded: "bg-green-500/10 text-emerald-200 border border-green-500/20",
};

const actionLabels = {
  "Not Submitted": "View Assignment",
  "In Progress": "Continue Work",
  Submitted: "View Submission",
  Graded: "View Grade",
};

export default function AssignmentCard({ assignment }) {
  const {
    id,
    title,
    description,
    course,
    dueDate,
    totalQuestions,
    estimatedTime,
    resources,
  } = assignment;

  const status = normalizeAssignmentStatus(assignment);

  const dueDateLabel = dueDate
    ? new Date(dueDate).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No due date";

  // Shorter form for the compact mobile card — same dueDate value, just less
  // text to scan (no year, no time) since space is tighter there.
  const compactDueDateLabel = dueDate
    ? new Date(dueDate).toLocaleDateString([], { month: "short", day: "numeric" })
    : "No due date";

  const courseName = course?.title ?? assignment.courseTitle ?? "Unknown course";

  return (
    <>
      {/* Desktop (xl+): unchanged */}
      <div className="hidden xl:block rounded-3xl border border-border bg-background p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-primary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                {courseName}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status] ?? "bg-muted text-foreground"}`}
              >
                {status ?? "Unknown"}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>

            <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
              {description ?? "No description available."}
            </p>
          </div>

          <div className="w-full min-w-44 flex flex-col gap-3 sm:flex">
            <div className="rounded-2xl bg-background p-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>Due {dueDateLabel}</span>
              </div>

              <div className="mt-3 grid gap-2 text-muted-foreground">
                {totalQuestions != null && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{totalQuestions} questions</span>
                  </div>
                )}

                {estimatedTime != null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{estimatedTime} min</span>
                  </div>
                )}

                {resources != null && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{resources} resource{resources !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>

            <Link href={`/student/assignments/${id}`}>
              <Button className="w-full">{actionLabels[status] ?? "View"}</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile & tablet: compact, scannable card — title, course, due date,
          status, and the primary action, nothing else competing for space. */}
      <div className="xl:hidden rounded-2xl border border-border bg-background p-4 space-y-2.5 transition-transform duration-200 active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-sm font-bold text-foreground leading-snug line-clamp-2">
            {title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[status] ?? "bg-muted text-foreground"}`}
          >
            {status ?? "Unknown"}
          </span>
        </div>

        <p className="truncate text-xs text-muted-foreground">{courseName}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays size={13} className="text-primary" />
          <span>Due {compactDueDateLabel}</span>
        </div>

        <Link href={`/student/assignments/${id}`} className="block">
          <Button className="w-full py-2.5 min-h-[40px] text-sm">
            {actionLabels[status] ?? "View"}
          </Button>
        </Link>
      </div>
    </>
  );
}
