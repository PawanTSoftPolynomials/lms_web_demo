"use client";

import {
    ArrowLeft,
    ArrowRight,
    Send,
} from "lucide-react";

import Button from "@/components/ui/Button";

export default function QuizNavigation({
                                           currentQuestion,
                                           totalQuestions,
                                           onPrevious,
                                           onNext,
                                           onSubmit,
                                           canGoPrevious,
                                           canGoNext,
                                           isSubmitting = false,
                                       }) {
    const isLastQuestion =
        currentQuestion === totalQuestions;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className="flex shrink-0 items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                {!isLastQuestion ? (
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={!canGoNext}
                        className="flex shrink-0 items-center gap-2"
                    >
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex shrink-0 items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <Send className="h-4 w-4" />

                        {isSubmitting
                            ? "Submitting..."
                            : "Submit Quiz"}
                    </Button>
                )}
            </div>
        </div>
    );
}