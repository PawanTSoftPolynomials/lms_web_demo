"use client";

import {
    ChevronLeft,
    ChevronRight,
    Send,
} from "lucide-react";

const STATUS_STYLES = {
    current:
        "border-primary bg-primary text-foreground shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
    answered:
        "border-emerald-500/60 bg-emerald-500/15 text-emerald-400 hover:border-emerald-400",
    visited:
        "border-amber-500/60 bg-amber-500/15 text-amber-400 hover:border-amber-400",
    unvisited:
        "border-transparent bg-muted/60 text-muted-foreground hover:border-transparent hover:text-foreground",
};

/**
 * Bottom nav bar for a quiz attempt: previous/next arrows around a
 * horizontally-scrollable strip of question-jump buttons, plus a submit
 * control that's reachable from any question (not only the last one).
 */
export default function QuizNavigation({
                                           questions = [],
                                           currentQuestionIndex = 0,
                                           answers = {},
                                           visitedIndices,
                                           onPrevious,
                                           onNext,
                                           onJumpTo,
                                           onSubmit,
                                           canGoPrevious,
                                           canGoNext,
                                           isSubmitting = false,
                                       }) {
    const statusFor = (index, questionId) => {
        if (index === currentQuestionIndex) return "current";
        if (answers[questionId] !== undefined) return "answered";
        if (visitedIndices?.has(index)) return "visited";
        return "unvisited";
    };

    return (
        <div className="rounded-2xl border border-border bg-background p-2 sm:p-3">
            <div className="flex items-center gap-2">
                {/* Left spacer mirrors the Submit button's width so the
                    prev/numbers/next cluster below sits truly centered
                    rather than centered-minus-Submit's-width. */}
                <div className="flex-1" />

                <div className="flex min-w-0 shrink items-center gap-2">
                    <button
                        type="button"
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        title="Previous question"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/60 text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex min-w-0 gap-2 overflow-x-auto scrollbar-none px-1 py-1">
                        {questions.map((question, index) => (
                            <button
                                key={question.id ?? index}
                                type="button"
                                onClick={() => onJumpTo?.(index)}
                                title={`Go to question ${index + 1}`}
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition cursor-pointer ${
                                    STATUS_STYLES[
                                        statusFor(index, question.id)
                                    ]
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!canGoNext}
                        title="Next question"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-muted/60 text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-1 justify-end">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        title="Submit & End Quiz"
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Send className="h-3.5 w-3.5" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
