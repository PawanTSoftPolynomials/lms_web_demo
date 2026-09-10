"use client";

import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { useResults } from "@/hooks/queries/instructor/useResults";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const COLUMNS = [
  {
    key: "student",
    header: "Student",
    render: (r) => (
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{r.studentName}</p>
        {r.studentEmail && (
          <p className="truncate text-[10px] font-semibold text-muted-foreground">{r.studentEmail}</p>
        )}
      </div>
    ),
  },
  { key: "title", header: "Final test", render: (r) => <span className="font-semibold">{r.title}</span> },
  { key: "courseTitle", header: "Course", render: (r) => r.courseTitle || "—" },
  {
    key: "score",
    header: "Score",
    align: "right",
    render: (r) => (
      <span className="font-bold tabular-nums">
        {r.score}/{r.totalMarks}
      </span>
    ),
  },
  {
    key: "percentage",
    header: "Percent",
    align: "right",
    render: (r) => <span className="tabular-nums">{r.percentage}%</span>,
  },
  {
    key: "passed",
    header: "Result",
    align: "center",
    render: (r) =>
      r.passed ? (
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
          Passed
        </span>
      ) : (
        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
          Failed
        </span>
      ),
  },
  {
    key: "submittedAt",
    header: "Attempted",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatDate(r.submittedAt)}</span>,
  },
];

/**
 * Students' MCQ attempts on Final tests only — Self-Test attempts are
 * practice and are excluded server-side via /results?quizTag=FINAL. Scores
 * are auto-marked at submit time, so this view is read-only.
 */
export default function FinalTestResultsPanel({ courseId }) {
  const { data, isLoading, isError } = useResults({
    quizTag: "FINAL",
    ...(courseId ? { courseId } : {}),
  });
  const rows = data?.studentResults || [];

  return (
    <Card className="space-y-4 border border-slate-850 bg-background/40 p-5">
      <div>
        <h2 className="text-sm font-bold text-foreground">Final test results</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Each student&apos;s attempt at your Final tests, marked automatically. Self-tests aren&apos;t included.
        </p>
      </div>

      {isError ? (
        <p role="alert" className="py-6 text-xs font-semibold text-red-400">
          Test results couldn&apos;t be loaded. Refresh the page to try again.
        </p>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey="submissionId"
          isLoading={isLoading}
          skeletonRows={4}
          emptyLabel="No students have attempted a Final test yet."
        />
      )}
    </Card>
  );
}
