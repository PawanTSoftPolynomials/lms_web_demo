"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

/**
 * The single completion control for the Content block currently open in the
 * learning workspace.
 *
 * `completed` is the backend's own flag, read out of the Progress roll-up via
 * lib/progressIndex — this component never derives completion, never counts
 * items and never touches a percentage. It renders one of three states for
 * whatever the player is showing, at any level of the hierarchy (Course-,
 * Module-, Lesson- or Topic-direct Content alike):
 *
 *   completed        -> a static "Completed" indicator (no second request)
 *   pending          -> disabled, so a double click can't submit twice
 *   otherwise        -> "Mark as Complete"
 *
 * VIDEO also completes automatically when it plays to the end, so the button
 * is never the *required* path for it; it stays available because an embedded
 * player that never fires `onEnded` would otherwise leave that item stuck.
 *
 * `readOnly` renders the same strip with no action at all. A Quiz uses it:
 * quiz completion is earned by passing (the backend sets QuizSubmission.passed
 * and the roll-up reads it), never by asserting it here, so the workspace
 * reports that state rather than offering a way to set it.
 */
export default function ContentCompletionBar({
  completed = false,
  isPending = false,
  isVideo = false,
  readOnly = false,
  readOnlyHint = null,
  onMarkComplete,
}) {
  if (completed) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-500">
          <CheckCircle2 size={16} className="shrink-0" />
          Completed
        </span>
        {isVideo && (
          <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Counted toward your course progress
          </span>
        )}
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <Circle size={14} className="shrink-0 text-muted-foreground/50" />
        <p className="min-w-0 text-[11px] font-semibold text-muted-foreground">
          {readOnlyHint || "Not completed yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <p className="min-w-0 text-[11px] font-semibold text-muted-foreground">
        {isVideo
          ? "Completes automatically when the video finishes."
          : "Finished with this item? Mark it complete to record your progress."}
      </p>
      <button
        type="button"
        onClick={onMarkComplete}
        disabled={isPending}
        aria-busy={isPending}
        className="shrink-0 min-h-[40px] flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition cursor-pointer outline-none hover:bg-primary/20 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin shrink-0" />
            Saving
          </>
        ) : (
          <>
            <CheckCircle2 size={14} className="shrink-0" />
            Mark as Complete
          </>
        )}
      </button>
    </div>
  );
}
