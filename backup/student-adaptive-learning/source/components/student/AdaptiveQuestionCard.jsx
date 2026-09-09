"use client";

import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react";

import Button from "@/components/ui/Button";

/**
 * Compact, accessible single-choice options — deliberately NOT the full-size
 * OptionList used by the live quiz attempt (that component is tuned for a
 * dedicated question page, not a compact panel embedded in the result page).
 * Native radiogroup semantics: arrow-key/tab navigable, screen-reader
 * announces "radio button, N of 4, selected/not selected".
 */
function AdaptiveOptions({ options, selectedAnswer, onSelect, disabled }) {
  return (
    <div role="radiogroup" aria-label="Answer options" className="space-y-2">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        return (
          <button
            key={option + index}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? "border-primary/70 bg-primary/10 text-foreground font-medium"
                : "border-border bg-background/40 text-foreground hover:border-primary/30 hover:bg-background/60"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                isSelected ? "border-primary" : "border-transparent"
              }`}
              aria-hidden="true"
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <span className="min-w-0 break-words">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The shared "mini interactive challenge" used for BOTH the post-remediation
 * verification check and independent-practice questions — one component, one
 * interaction pattern, so the two never visually diverge. Never shows
 * strategy names, KC ids, or backend `reason` text; next-step language comes
 * from adaptiveCopy.js's student-facing translations only.
 *
 * `onContinue`/`continueLabel` are optional — when passed, the result view
 * renders one primary CTA driving what happens next (a new remediation
 * round, practice, or navigation) instead of a static "what's next" preview.
 * Omit them for a self-contained result with no follow-up action (e.g. the
 * independent-practice question, which doesn't chain into anything further).
 *
 * @param {"loading"|"ready"|"submitting"|"result"|"generation_error"|"evaluation_error"} phase
 */
export default function AdaptiveQuestionCard({
  phase,
  kicker,
  intro,
  loadingMessage,
  question,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  onRetryGeneration,
  result,
  correctFeedback,
  incorrectFeedback,
  onContinue,
  continueLabel,
}) {
  if (phase === "loading") {
    return (
      <div className="rounded-2xl border border-border bg-background/40 p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <p className="text-xs text-muted-foreground">{loadingMessage || "Preparing your next question..."}</p>
        </div>
      </div>
    );
  }

  if (phase === "generation_error") {
    return (
      <div className="rounded-2xl border border-border bg-background/30 p-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          Your personalized guidance couldn&apos;t be loaded.
        </span>
        <button
          type="button"
          onClick={onRetryGeneration}
          className="inline-flex items-center gap-1 text-primary hover:text-orange-300 font-semibold cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 rounded"
        >
          <RefreshCw size={12} />
          Try again
        </button>
      </div>
    );
  }

  if (!question) return null;

  if (phase === "result" && result) {
    return (
      <div className="rounded-2xl border border-border bg-background/40 p-5" role="status" aria-live="polite">
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${
              result.isCorrect ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {result.isCorrect ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <XCircle className="h-4.5 w-4.5 shrink-0" />
            )}
            <span>{result.isCorrect ? "Correct" : "Not quite"}</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {result.isCorrect
              ? correctFeedback || "Your understanding is improving."
              : incorrectFeedback || "We'll keep working on this concept."}
          </p>

          {onContinue && (
            <div className="pt-3 border-t border-border/70 flex justify-end">
              <Button onClick={onContinue} className="min-h-[38px] px-4 py-1.5 text-sm">
                {continueLabel || "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // "ready" | "submitting" | "evaluation_error" — the question never
  // disappears while a submission is in flight.
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-5">
      <div className="flex flex-col gap-3.5">
        <div>
          <p className="text-[10px] text-primary/90 font-bold uppercase tracking-wider">{kicker}</p>
          {intro && <p className="text-xs text-muted-foreground mt-0.5">{intro}</p>}
        </div>

        <p className="text-sm font-medium text-foreground">{question.question}</p>

        <AdaptiveOptions
          options={question.options}
          selectedAnswer={selectedAnswer}
          onSelect={onSelectAnswer}
          disabled={phase === "submitting"}
        />

        {phase === "evaluation_error" && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5" role="alert">
            <AlertTriangle size={12} />
            Couldn&apos;t submit your answer. Please try again.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={!selectedAnswer || phase === "submitting"}
            loading={phase === "submitting"}
            className="min-h-[38px] px-4 py-1.5 text-sm"
          >
            Check answer
          </Button>
        </div>
      </div>
    </div>
  );
}
