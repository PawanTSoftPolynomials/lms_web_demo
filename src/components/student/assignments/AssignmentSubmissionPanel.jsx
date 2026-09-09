"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Paperclip, Upload, X } from "lucide-react";

import { uploadAssignmentSubmissionFile } from "@/services/assignment.service";
import useSubmitAssignment from "@/hooks/queries/student/useSubmitAssignment";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * The student's view of one Assignment: the instructor's brief, the
 * instructor's reference material, and the single PDF upload that IS the
 * submission.
 *
 * There is exactly one way to submit — upload the completed work as a PDF.
 * Completion is never asserted here: the item is complete when the backend
 * says so, which happens after POST /assignments/:id/submit records the
 * submission and the existing roll-up recomputes. `completed` is passed in
 * from the backend Progress index by the workspace; this component computes
 * no percentage and increments no counter.
 */

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const isPdf = (file) =>
  file?.type === "application/pdf" && /\.pdf$/i.test(file?.name || "");

export default function AssignmentSubmissionPanel({ assignment, completed = false }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const submitMutation = useSubmitAssignment(assignment?.id);

  const submission = assignment?.submission || null;
  const hasSubmitted = Boolean(submission?.fileUrl) || assignment?.status === "Submitted";
  // Instructor-provided reference material — never the student's own answer.
  const attachments = Array.isArray(assignment?.attachments) ? assignment.attachments : [];

  const isBusy = isUploading || submitMutation.isPending;

  const pickFile = (file) => {
    if (!file) return;
    if (!isPdf(file)) {
      showToast("Only PDF files can be submitted. Please choose a .pdf file.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    // Guard rather than trust the disabled attribute — nothing may be recorded
    // without a real PDF, and no second request may start while one is running.
    if (isBusy || !selectedFile || !isPdf(selectedFile)) return;

    setIsUploading(true);
    let uploaded;
    try {
      // Upload first. Only a stored file yields the fileUrl the submit
      // endpoint requires, so a failed upload can never mark this complete.
      uploaded = await uploadAssignmentSubmissionFile(selectedFile);
    } catch (error) {
      setIsUploading(false);
      showToast(error?.message || "Could not upload your PDF. Please try again.", "error");
      return;
    }
    setIsUploading(false);

    submitMutation.mutate(uploaded, {
      onSuccess: () => {
        clearFile();
        showToast("Assignment submitted.", "success");
      },
      onError: (error) => {
        showToast(
          error?.response?.data?.message || "Submission failed. Your work was not recorded.",
          "error"
        );
      },
    });
  };

  return (
    <div className="max-w-3xl w-full mx-auto rounded-2xl border border-border bg-card">
      {/* ---- ASSIGNMENT BRIEF ---- */}
      <section className="p-4 sm:p-6 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Assignment
        </p>
        <h2 className="text-lg sm:text-xl font-bold text-foreground text-balance">
          {assignment?.title || "Assignment"}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-muted-foreground">
          {assignment?.dueDate && (
            <span>Due {new Date(assignment.dueDate).toLocaleString()}</span>
          )}
          {Number.isFinite(assignment?.marks) && <span>{assignment.marks} marks</span>}
        </div>

        <div className="pt-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            Assignment Instructions
          </p>
          {assignment?.description ? (
            // The instructor's brief in full — never truncated.
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {assignment.description}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No instructions were provided for this assignment.
            </p>
          )}
        </div>
      </section>

      {/* ---- INSTRUCTOR REFERENCE MATERIAL ---- */}
      {attachments.length > 0 && (
        <section className="border-t border-border p-4 sm:p-6 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Reference Material
            </p>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              Provided by your instructor. This is not your submission.
            </p>
          </div>
          <div className="space-y-2">
            {attachments.map((file, i) => (
              <div
                key={file.url || `${file.name}-${i}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2.5"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Paperclip size={14} className="shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs font-semibold text-foreground">
                    {file.name || "Attachment"}
                  </span>
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 self-start sm:self-auto min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  View Attachment
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- YOUR SUBMISSION ---- */}
      <section className="border-t border-border p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Your Submission
          </p>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
            Complete the assignment and upload your final answer as a PDF.
          </p>
        </div>

        {/* What was already turned in, so the student can see their own work. */}
        {hasSubmitted && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <CheckCircle2 size={15} className="shrink-0" />
              {completed ? "Submitted · Completed" : "Submitted"}
            </p>
            {submission?.fileName && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="shrink-0 text-emerald-500" />
                  <span className="truncate text-xs font-semibold text-foreground">
                    {submission.fileName}
                  </span>
                  {formatBytes(submission.fileSize) && (
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
                      {formatBytes(submission.fileSize)}
                    </span>
                  )}
                </span>
                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 self-start sm:self-auto min-h-[36px] inline-flex items-center rounded-lg border border-emerald-500/40 px-3 py-1.5 text-[11px] font-bold text-emerald-500 transition hover:bg-emerald-500/15"
                  >
                    View PDF
                  </a>
                )}
              </div>
            )}
            {submission?.submittedAt && (
              <p className="text-[10px] font-semibold text-muted-foreground">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Upload control — the one and only submission method. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />

        {selectedFile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2.5">
            <span className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="shrink-0 text-primary" />
              <span className="truncate text-xs font-semibold text-foreground">
                {selectedFile.name}
              </span>
              {formatBytes(selectedFile.size) && (
                <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </span>
              )}
            </span>
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="min-h-[36px] rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition cursor-pointer hover:border-primary/40 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clearFile}
                disabled={isBusy}
                aria-label="Remove selected file"
                className="min-h-[36px] w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground transition cursor-pointer hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-background/40 px-4 py-7 sm:py-9 text-center transition cursor-pointer hover:border-primary/50 hover:bg-background/60 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Upload size={20} className="shrink-0 text-muted-foreground transition group-hover:text-primary" />
            <span className="text-xs font-bold text-foreground transition group-hover:text-primary">
              {hasSubmitted ? "Upload a New Assignment PDF" : "Upload Assignment PDF"}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Choose your completed PDF
            </span>
          </button>
        )}

        <p className="text-[10px] font-semibold text-muted-foreground">
          PDF only, up to 20MB.
          {hasSubmitted && " Submitting again replaces your previous PDF."}
        </p>

        <div className="flex sm:justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy || !selectedFile}
          aria-busy={isBusy}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition cursor-pointer shadow-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin shrink-0" />
              Uploading
            </>
          ) : submitMutation.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin shrink-0" />
              Submitting
            </>
          ) : (
            "Submit Assignment"
          )}
        </button>
        </div>
      </section>
    </div>
  );
}
