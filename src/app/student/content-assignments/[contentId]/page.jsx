"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Download, FileText, Quote, X } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useContent } from "@/hooks/queries/student/useContent";
import useContentSubmission from "@/hooks/queries/student/useContentSubmission";
import ContentAssignmentPanel from "@/components/student/learning/ContentAssignmentPanel";
import SubmissionStatusBadge from "@/components/student/submissions/SubmissionStatusBadge";
import { formatDate, formatTime, parseAssignmentGrade } from "@/features/student/constants/submissionsConfig";
import { getDisplayUrl } from "@/lib/blob";
import { unescapeFromContentApi } from "@/lib/markdown";

const SUBMISSIONS_HREF = "/student/assignments";

/** Same "<epoch>-<original name>" -> "<original name>" cleanup VideoPlayer's
 * inline assignment block uses for its single fileUrl attachment. */
function attachmentName(content) {
  const recorded = content?.data?.originalName || content?.data?.fileName;
  if (recorded) return recorded;
  const raw = content?.fileUrl;
  if (!raw) return "Attachment";
  try {
    const last = raw.split("?")[0].split("#")[0].split("/").pop();
    if (!last) return "Attachment";
    return decodeURIComponent(last).replace(/^\d{10,}-/, "");
  } catch {
    return "Attachment";
  }
}

/** A read-only fact about the submission — tinted, not bordered. Matches the quiz result page's StatTile. */
function StatTile({ icon: Icon, label, value, detail }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 p-3.5 sm:p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon size={13} className="shrink-0 text-primary" aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold leading-snug text-foreground sm:text-lg">{value}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

/**
 * Result page for a lesson-composer Assignment block (a Content row, not a
 * real Assignment row) — the counterpart to /student/assignments/:id for
 * assignments authored inside a lesson rather than the standalone Assignments
 * feature. Content carries no dueDate/marks (those are Assignment-model-only
 * fields), so this shows what it actually has: submission, grade, feedback.
 */
export default function ContentAssignmentResultPage({ params }) {
  const { contentId } = use(params);

  const { data: content, isLoading: isContentLoading, isError: isContentError } = useContent(contentId);
  const { data: submission, isLoading: isSubmissionLoading } = useContentSubmission(contentId);

  // Reopens the submission form over an already-submitted-but-not-yet-graded
  // block — mirrors the quiz result page's "Retake Quiz" and the standalone
  // Assignment result page's "Resubmit Assignment". Hidden once graded (see
  // below) so a graded submission can't be quietly swapped out afterward.
  const [isResubmitting, setIsResubmitting] = useState(false);

  if (isContentLoading || isSubmissionLoading) {
    return <Loader />;
  }

  if (isContentError || !content) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Assignment not found</h2>
        <p className="mt-2 text-muted-foreground">The requested assignment could not be loaded.</p>
      </Card>
    );
  }

  const instructions = content.htmlContent ? unescapeFromContentApi(content.htmlContent) : "";
  const attachments = content.fileUrl ? [{ url: content.fileUrl, name: attachmentName(content) }] : [];
  const hasSubmitted = Boolean(submission);
  const graded = Boolean(submission?.grade);
  const grade = graded ? parseAssignmentGrade(submission.grade, null) : null;
  const status = graded ? "graded" : hasSubmitted ? "pending" : "todo";

  // ---- Not yet submitted, or actively resubmitting: the brief + upload form ----
  if (!hasSubmitted || isResubmitting) {
    return (
      <div className="space-y-8">
        {isResubmitting ? (
          <div className="flex items-center justify-between gap-3">
            <PageHeader
              title={content.title || "Assignment"}
              subtitle="Resubmitting will replace your previous submission."
            />
            <button
              type="button"
              onClick={() => setIsResubmitting(false)}
              className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              <X size={15} aria-hidden />
              Cancel
            </button>
          </div>
        ) : (
          <PageHeader title={content.title || "Assignment"} subtitle="Assignment details" />
        )}

        <ContentAssignmentPanel
          contentId={contentId}
          instructions={instructions}
          attachments={attachments}
          onSubmitted={() => setIsResubmitting(false)}
        />
      </div>
    );
  }

  // ---- Already submitted: a read-only result view, same spirit as the quiz result page ----
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12 sm:space-y-8">
      <Link
        href={SUBMISSIONS_HREF}
        className="-ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to Submissions
      </Link>

      <section
        aria-labelledby="result-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Assignment
            </p>
            <h1
              id="result-title"
              className="mt-1.5 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {content.title || "Assignment"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-5 md:flex-col md:items-end md:gap-2 md:text-right">
            <p
              className={`text-4xl font-bold leading-none tracking-tight ${
                graded ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              }`}
            >
              {graded ? grade?.text || "Graded" : "—"}
            </p>
            <div className="space-y-1.5 md:flex md:flex-col md:items-end">
              {graded && grade?.percentage != null && (
                <p className="text-sm font-semibold text-foreground">{grade.percentage}%</p>
              )}
              <SubmissionStatusBadge status={status} />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Submission details" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          icon={CalendarClock}
          label="Submitted"
          value={formatDate(submission?.submittedAt)}
          detail={formatTime(submission?.submittedAt)}
        />
        <StatTile icon={FileText} label="Status" value={graded ? "Graded" : "Pending review"} />
      </section>

      <Card tone="flat">
        <h3 className="text-lg font-semibold text-foreground">Your Submission</h3>
        <div className="mt-4 space-y-3">
          {submission?.fileName && (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex min-w-0 items-center gap-2">
                <FileText size={14} className="shrink-0 text-primary" />
                <span className="truncate text-sm font-semibold text-foreground">{submission.fileName}</span>
              </span>
              {submission.fileUrl && (
                <a
                  href={getDisplayUrl(submission.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 sm:self-auto"
                >
                  <Download size={13} aria-hidden />
                  View PDF
                </a>
              )}
            </div>
          )}
          {submission?.textAnswer && (
            <div className="rounded-xl border border-border bg-background/40 px-3 py-3">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Written Answer
              </p>
              <p className="whitespace-pre-wrap break-words text-sm text-foreground">{submission.textAnswer}</p>
            </div>
          )}
          {!submission?.fileName && !submission?.textAnswer && (
            <p className="text-sm italic text-muted-foreground">No submission details available.</p>
          )}
        </div>
      </Card>

      {submission?.feedback && (
        <Card tone="flat" className="border-emerald-500/25 bg-emerald-500/5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Quote size={18} className="text-emerald-500" aria-hidden />
            Instructor Feedback
          </h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {submission.feedback}
          </p>
        </Card>
      )}

      {instructions && (
        <Card tone="flat">
          <h3 className="text-lg font-semibold text-foreground">Assignment Instructions</h3>
          <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
            {instructions}
          </div>
        </Card>
      )}

      {!graded && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsResubmitting(true)}>
            Resubmit Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
