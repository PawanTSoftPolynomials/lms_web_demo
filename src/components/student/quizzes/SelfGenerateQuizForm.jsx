"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { QUESTION_COUNT_OPTIONS } from "@/features/student/constants/quizzesConfig";

export default function SelfGenerateQuizForm({
  coursesList,
  selectedCourse,
  numQuestions,
  setNumQuestions,
  onGenerate,
  isGenerating,
  generationError,
}) {
  const currentCourse = coursesList.find((c) => c.id === selectedCourse);

  return (
    <div className="max-w-xl mx-auto py-2">
      <div className="rounded-2xl border border-border bg-background/60 p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/20 shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">Self-Generate Practice Quiz</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Dynamically generate a practice quiz from course questions.</p>
          </div>
        </div>

        <div className="border-t border-border/80 pt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Target Course</label>
            <div className="rounded-xl bg-background border border-border px-4 py-3 text-xs sm:text-sm font-semibold text-foreground min-h-[44px] flex items-center">
              {currentCourse?.title ?? "Target Course"}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Number of Questions</label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
              disabled={isGenerating}
              className="bg-background border border-border rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {QUESTION_COUNT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {generationError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 font-semibold uppercase tracking-wide">
              {generationError}
            </div>
          )}

          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-orange-600 text-slate-950 font-black uppercase text-xs tracking-widest shadow-md shadow-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <span>Generate Quiz & Start</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
