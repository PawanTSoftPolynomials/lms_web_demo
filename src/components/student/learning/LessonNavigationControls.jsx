"use client";

import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// Previous/Complete/Next lesson controls. `variant="compact"` is the mobile
// row directly under the video player; `variant="full"` is the desktop bar
// at the bottom of the page. Both share the same navigation rules (passed in
// via the on* callbacks) — only the layout/density differs.
export default function LessonNavigationControls({
  variant = "full",
  previousLesson,
  nextLesson,
  nextModule,
  selectedLesson,
  isSelectedLessonCompleted,
  onSelectPrevious,
  onSelectNext,
  onMarkComplete,
}) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 xl:hidden">
        <button
          type="button"
          disabled={!previousLesson}
          onClick={onSelectPrevious}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border border-slate-700 font-bold text-[10px] uppercase tracking-wide text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            !previousLesson ? "opacity-30 cursor-not-allowed hover:border-slate-700 hover:text-slate-300" : ""
          }`}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          disabled={isSelectedLessonCompleted}
          onClick={onMarkComplete}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border font-bold text-[10px] uppercase tracking-wide transition before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            isSelectedLessonCompleted
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default"
              : "border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 cursor-pointer bg-transparent"
          }`}
        >
          <CheckCircle2 size={14} />
          <span>{isSelectedLessonCompleted ? "Completed" : "Complete"}</span>
        </button>

        <button
          type="button"
          disabled={!nextLesson}
          onClick={onSelectNext}
          className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-[10px] uppercase tracking-wide text-slate-950 transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
            !nextLesson ? "opacity-40 cursor-not-allowed bg-orange-500/40 text-slate-400" : ""
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
        disabled={!previousLesson}
        onClick={onSelectPrevious}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-700 font-extrabold text-xs text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer ${
          !previousLesson ? "opacity-30 cursor-not-allowed hover:border-slate-700 text-slate-500" : ""
        }`}
      >
        <ChevronLeft size={16} />
        <span>Previous Lesson</span>
      </button>

      <div className="text-center font-mono py-1 sm:py-0 truncate max-w-full">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
          Active Lesson Pathway
        </span>
        <p className="text-xs font-bold text-orange-400 truncate max-w-[200px] sm:max-w-[280px]">
          {selectedLesson?.title || "Course Lesson"}
        </p>
      </div>

      <button
        disabled={!nextLesson}
        onClick={onSelectNext}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 font-black text-xs text-slate-950 transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer ${
          !nextLesson ? "opacity-40 cursor-not-allowed bg-orange-500/40 text-slate-400" : ""
        }`}
      >
        <span>
          {nextLesson
            ? nextModule
              ? `Continue to ${nextModule.title}`
              : "Next Lesson"
            : "Course Completed 🎉"}
        </span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
