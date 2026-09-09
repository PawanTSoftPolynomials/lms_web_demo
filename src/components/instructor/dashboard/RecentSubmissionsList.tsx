"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { RecentSubmission } from "@/services/instructor/dashboardHome.service";

/**
 * Latest work handed in, newest first.
 *
 * The status is a read-only indicator, so it is plain coloured text rather than
 * a bordered pill — a border here reads as a button and invites a click that
 * does nothing.
 */
function statusTone(status: string | undefined) {
  switch (status?.toUpperCase()) {
    case "GRADED":
      return "text-success";
    case "PENDING":
    case "SUBMITTED":
      return "text-warning";
    case "LATE":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function RecentSubmissionsList({
  submissions,
  isLoading,
}: {
  submissions: RecentSubmission[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <div className="h-full min-h-[13rem] animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Recent submissions
        </h2>
        <Link
          href="/instructor/assignments"
          className="inline-flex min-h-11 items-center shrink-0 text-xs font-medium text-link hover:text-link-hover hover:underline"
        >
          View all
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing handed in yet.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {submissions.slice(0, 4).map((sub) => (
            <li key={sub.id} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <FileText
                  size={16}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{sub.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">{sub.assignmentName}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-xs font-medium ${statusTone(sub.status)}`}>
                  {sub.status}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{sub.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
