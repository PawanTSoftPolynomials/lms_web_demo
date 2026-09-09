"use client";

import { CheckCircle2, Download, ExternalLink, FileText } from "lucide-react";

import { useAssignmentSubmissions } from "@/hooks/queries/instructor/useAssignments";

/**
 * The students who have submitted one assignment, and the PDF each of them
 * actually uploaded.
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

export default function AssignmentSubmissionsPanel({ assignmentId, open = false }) {
  const { data, isLoading, isError } = useAssignmentSubmissions(assignmentId, open);

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
          className="rounded-xl border border-border bg-background/50 px-3 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
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
            ) : (
              // Submitted before PDF upload existed, so there is no file to open.
              <p className="text-[11px] font-semibold italic text-muted-foreground">
                Submitted without a file attached.
              </p>
            )}

            {s.submittedAt && (
              <p className="text-[10px] font-semibold text-muted-foreground">
                Submitted {new Date(s.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          {s.fileUrl && (
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <a
                href={s.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <ExternalLink size={12} /> View PDF
              </a>
              <a
                href={s.fileUrl}
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
      ))}
    </div>
  );
}
