"use client";

import { useEffect, useRef } from "react";
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
    const numbersContainerRef = useRef(null);

    const statusFor = (index, questionId) => {
        if (index === currentQuestionIndex) return "current";
        if (answers[questionId] !== undefined) return "answered";
        if (visitedIndices?.has(index)) return "visited";
        return "unvisited";
    };

    // Auto-scroll active question number into view inside the scrollable strip
    useEffect(() => {
        if (numbersContainerRef.current) {
            const activeButton = numbersContainerRef.current.querySelector('[data-active="true"]');
            if (activeButton && typeof activeButton.scrollIntoView === "function") {
                activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
            }
        }
    }, [currentQuestionIndex]);

    return (
        <div className="rounded-2xl border border-border bg-background p-1.5 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Desktop left spacer for visual centering of middle cluster */}
                <div className="hidden sm:block sm:flex-1" />

                {/* Main navigation row: Prev (fixed) | Question Numbers (scrollable) | Next (fixed) */}
                <div className="flex flex-1 sm:flex-none min-w-0 sm:shrink items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        title="Previous question"
                        className="flex h-9 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-transparent bg-muted/60 text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    <div
                        ref={numbersContainerRef}
                        className="flex flex-1 sm:flex-initial min-w-0 gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5"
                    >
                        {questions.map((question, index) => {
                            const isCurrent = index === currentQuestionIndex;
                            return (
                                <button
                                    key={question.id ?? index}
                                    type="button"
                                    data-active={isCurrent ? "true" : "false"}
                                    onClick={() => onJumpTo?.(index)}
                                    title={`Go to question ${index + 1}`}
                                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                                        STATUS_STYLES[
                                            statusFor(index, question.id)
                                        ]
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!canGoNext}
                        title="Next question"
                        className="flex h-9 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-transparent bg-muted/60 text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Submit button (fixed right) */}
                <div className="flex shrink-0 sm:flex-1 sm:justify-end">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        title="Submit & End Quiz"
                        className="flex h-9 sm:h-10 shrink-0 items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-green-600 px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
