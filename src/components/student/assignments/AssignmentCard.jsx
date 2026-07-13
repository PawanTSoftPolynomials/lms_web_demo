import Link from "next/link";
import { CalendarDays, Clock, BookOpen, FileText } from "lucide-react";

import Button from "@/components/ui/Button";

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
    status,
    totalQuestions,
    estimatedTime,
    resources,
  } = assignment;

  const dueDateLabel = dueDate
    ? new Date(dueDate).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No due date";

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-orange-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {course?.title ?? assignment.courseTitle ?? "Unknown course"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status] ?? "bg-slate-800 text-slate-200"}`}
            >
              {status ?? "Unknown"}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>

          <p className="text-sm leading-6 text-slate-400 line-clamp-3">
            {description ?? "No description available."}
          </p>
        </div>

        <div className="w-full min-w-44 flex flex-col gap-3 sm:flex">
          <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              <span>Due {dueDateLabel}</span>
            </div>

            <div className="mt-3 grid gap-2 text-slate-400">
              {totalQuestions != null && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span>{totalQuestions} questions</span>
                </div>
              )}

              {estimatedTime != null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>{estimatedTime} min</span>
                </div>
              )}

              {resources != null && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-500" />
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
  );
}
