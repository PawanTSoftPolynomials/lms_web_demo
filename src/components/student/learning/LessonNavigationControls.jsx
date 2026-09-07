"use client";

import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// Previous/Complete/Next controls, generalized over the navigation unit via
// `unitLabel` ("Topic" for the primary topic-scoped pathway, "Lesson" for
// the zero-Topic fallback) so both callers share one component instead of
// forking near-identical copies. `variant="compact"` is the mobile row
// directly under the video player; `variant="full"` is the desktop bar at
// the bottom of the page. Both share the same navigation rules (passed in
// via the on* callbacks) — only the layout/density differs.
export default function LessonNavigationControls({
  variant = "full",
  unitLabel = "Lesson",
  previousItem,
  nextItem,
  nextGroupTitle,
  currentTitle,
  isCompleted,
  onSelectPrevious,
  onSelectNext,
  onMarkComplete,
}) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 xl:hidden">
        <button
          type="button"
          disabled={!previousItem}
          onClick={onSelectPrevious}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border border-transparent font-bold text-[10px] uppercase tracking-wide text-foreground hover:text-foreground hover:border-primary transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            !previousItem ? "opacity-30 cursor-not-allowed hover:border-transparent hover:text-foreground" : ""
          }`}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          disabled={isCompleted}
          onClick={onMarkComplete}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border font-bold text-[10px] uppercase tracking-wide transition before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            isCompleted
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default"
              : "border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 cursor-pointer bg-transparent"
          }`}
        >
          <CheckCircle2 size={14} />
          <span>{isCompleted ? "Completed" : "Complete"}</span>
        </button>

        <button
          type="button"
          disabled={!nextItem}
          onClick={onSelectNext}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-primary hover:bg-orange-600 font-bold text-[10px] uppercase tracking-wide text-slate-950 transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            !nextItem ? "opacity-40 cursor-not-allowed bg-primary/40 text-muted-foreground" : ""
          }`}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0d0e16]/80 border border-[#1e2030] shadow-xl backdrop-blur-md min-w-0">
      <button
        disabled={!previousItem}
        onClick={onSelectPrevious}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-transparent font-extrabold text-xs text-foreground hover:text-foreground hover:border-primary transition cursor-pointer ${
          !previousItem ? "opacity-30 cursor-not-allowed hover:border-transparent text-muted-foreground" : ""
        }`}
      >
        <ChevronLeft size={16} />
        <span>Previous {unitLabel}</span>
      </button>

      <div className="text-center font-mono py-1 sm:py-0 truncate max-w-full">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
          Active {unitLabel} Pathway
        </span>
        <p className="text-xs font-bold text-primary truncate max-w-[200px] sm:max-w-[280px]">
          {currentTitle || `Course ${unitLabel}`}
        </p>
      </div>

      <button
        disabled={!nextItem}
        onClick={onSelectNext}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-primary hover:bg-orange-600 font-black text-xs text-slate-950 transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer ${
          !nextItem ? "opacity-40 cursor-not-allowed bg-primary/40 text-muted-foreground" : ""
        }`}
      >
        <span>
          {nextItem
            ? nextGroupTitle
              ? `Continue to ${nextGroupTitle}`
              : `Next ${unitLabel}`
            : "Course Completed 🎉"}
        </span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
