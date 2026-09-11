import { SUBMISSION_STATUS_LABELS } from "@/features/student/constants/submissionsConfig";

// A read-only indicator: tinted and never bordered, so it can't be mistaken
// for a button.
const TONES = {
  passed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  graded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
  // The theme remaps amber-* onto its brand secondary, so "waiting" uses
  // the dedicated warning token instead.
  pending: "bg-warning/10 text-warning",
  submitted: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  in_progress: "bg-primary/10 text-primary",
  todo: "bg-muted text-muted-foreground",
};

/** The status of a submission or quiz attempt, shared by the Submissions list and the quiz result page. */
export default function SubmissionStatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        TONES[status] || TONES.todo
      } ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {SUBMISSION_STATUS_LABELS[status] || status}
    </span>
  );
}
