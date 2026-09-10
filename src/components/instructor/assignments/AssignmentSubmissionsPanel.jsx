"use client";

import { useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, Loader2 } from "lucide-react";

import { getDisplayUrl } from "@/lib/blob";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useAssignmentSubmissions,
  useContentSubmissions,
  useGradeSubmission,
} from "@/hooks/queries/instructor/useAssignments";

/**
 * The students who have submitted one assignment, the PDF each of them
 * actually uploaded, and the instructor's grade + feedback for each.
 *
 * `fileUrl` here is the STUDENT's work. It is deliberately never mixed with
 * Assignment.attachments, which is the instructor's own reference material —
 * they are two different files with two different roles.
 */

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Grade + feedback for one submission, seeded from what is already saved. */
function GradeForm({ submission, onSave, isPending }) {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");

  const trimmedGrade = grade.trim();
  const unchanged =
    trimmedGrade === (submission.grade || "") && feedback.trim() === (submission.feedback || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmedGrade || unchanged || isPending) return;
    onSave({ grade: trimmedGrade, feedback: feedback.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/60 pt-2.5 flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <label htmlFor={`grade-${submission.id}`} className="sr-only">
        Grade
      </label>
      <input
        id={`grade-${submission.id}`}
        type="text"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        maxLength={20}
        placeholder="Grade (e.g. A, 8/10)"
        className="sm:w-40 min-h-[36px] rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
      />
      <label htmlFor={`feedback-${submission.id}`} className="sr-only">
        Feedback
      </label>
      <textarea
        id={`feedback-${submission.id}`}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={2000}
        rows={1}
        placeholder="Feedback for the student (optional)"
        className="flex-1 min-h-[36px] rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary resize-y"
      />
      <button
        type="submit"
        disabled={!trimmedGrade || unchanged || isPending}
        aria-busy={isPending}
        className="min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-950 transition cursor-pointer hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 size={12} className="animate-spin shrink-0" />
            Saving
          </>
        ) : submission.grade ? (
          "Update Grade"
        ) : (
          "Save Grade"
        )}
      </button>
    </form>
  );
}

export default function AssignmentSubmissionsPanel({ assignmentId, contentId, open = false }) {
  // Pass `contentId` instead of `assignmentId` for a lesson-composer
  // Assignment block (a Content row); its submissions live behind /contents.
  const assignmentQuery = useAssignmentSubmissions(assignmentId, open);
  const contentQuery = useContentSubmissions(contentId, open);
  const { data, isLoading, isError } = contentId ? contentQuery : assignmentQuery;

  const gradeMutation = useGradeSubmission({ assignmentId, contentId });
  const [savingId, setSavingId] = useState(null);
  const { showToast } = useToast();

  const saveGrade = (submissionId, payload) => {
    setSavingId(submissionId);
    gradeMutation.mutate(
      { submissionId, ...payload },
      {
        onSuccess: () => showToast("Grade saved.", "success"),
        onError: (error) =>
          showToast(error?.response?.data?.message || "Could not save the grade. Please try again.", "error"),
        onSettled: () => setSavingId(null),
      }
    );
  };

  if (!open) return null;

  if (isLoading) {
    return (
      <p className="px-1 py-3 text-[11px] font-semibold text-muted-foreground">
        Loading submissions…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="px-1 py-3 text-[11px] font-semibold text-red-400">
        Could not load submissions for this assignment.
      </p>
    );
  }

  const submissions = data?.submissions || [];

  if (submissions.length === 0) {
    return (
      <p className="px-1 py-3 text-[11px] font-semibold text-muted-foreground italic">
        No students have submitted this assignment yet.
      </p>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      {submissions.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-border bg-background/50 px-3 py-2.5 flex flex-col gap-2.5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="truncate text-xs font-bold text-foreground">{s.studentName}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 size={10} /> {s.status || "Submitted"}
                </span>
                {s.grade && (
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">
                    Grade {s.grade}
                  </span>
                )}
              </div>

              {s.studentEmail && (
                <p className="truncate text-[10px] font-semibold text-muted-foreground">
                  {s.studentEmail}
                </p>
              )}

              {s.fileName ? (
                <p className="flex items-center gap-1.5 min-w-0 text-[11px] font-semibold text-foreground">
                  <FileText size={12} className="shrink-0 text-primary" />
                  <span className="truncate">{s.fileName}</span>
                  {formatBytes(s.fileSize) && (
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatBytes(s.fileSize)}
                    </span>
                  )}
                </p>
              ) : !s.textAnswer ? (
                // Submitted before uploads existed, so there is nothing to open.
                <p className="text-[11px] font-semibold italic text-muted-foreground">
                  Submitted without a file or written answer.
                </p>
              ) : null}

              {s.submittedAt && (
                <p className="text-[10px] font-semibold text-muted-foreground">
                  Submitted {new Date(s.submittedAt).toLocaleString()}
                </p>
              )}
            </div>

            {s.fileUrl && (
              <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                <a
                  href={getDisplayUrl(s.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <ExternalLink size={12} /> View PDF
                </a>
                <a
                  href={getDisplayUrl(s.fileUrl)}
                  download={s.fileName || true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <Download size={12} /> Download
                </a>
              </div>
            )}
          </div>

          {s.textAnswer && (
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Written Answer
              </p>
              <p className="text-xs text-foreground whitespace-pre-wrap break-words">{s.textAnswer}</p>
            </div>
          )}

          {/* Keyed on the saved values so the form re-seeds after a save lands. */}
          <GradeForm
            key={`${s.id}-${s.grade ?? ""}-${s.feedback ?? ""}`}
            submission={s}
            isPending={savingId === s.id}
            onSave={(payload) => saveGrade(s.id, payload)}
          />
        </div>
      ))}
    </div>
  );
}
