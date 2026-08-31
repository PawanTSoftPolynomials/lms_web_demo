"use client";

import Button from "@/components/ui/Button";

export default function QuizSubmitModal({
    isOpen,
    onClose,
    onConfirm,
    totalQuestions = 0,
    answeredQuestions = 0,
    isSubmitting = false,
}) {
    if (!isOpen) return null;

    const unansweredQuestions = Math.max(0, totalQuestions - answeredQuestions);
    const hasUnanswered = unansweredQuestions > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
                {/* Header */}
                <div className="border-b border-border px-6 py-5">
                    <h2 className="text-2xl font-bold text-foreground">
                        {hasUnanswered ? "Incomplete Quiz Attempt" : "Submit Quiz"}
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        {hasUnanswered
                            ? "Please answer all questions before submitting your attempt."
                            : "Please review your quiz before final submission."}
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-muted p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Questions
                            </p>

                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {totalQuestions}
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-500/10 p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Answered
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-400">
                                {answeredQuestions}
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-500/10 p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Remaining
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-400">
                                {unansweredQuestions}
                            </p>
                        </div>
                    </div>

                    {hasUnanswered ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                            <p className="font-medium text-rose-400">
                                Action Required
                            </p>

                            <p className="mt-2 text-sm text-foreground">
                                You still have{" "}
                                <strong>
                                    {unansweredQuestions}
                                </strong>{" "}
                                unanswered{" "}
                                {unansweredQuestions === 1
                                    ? "question"
                                    : "questions"}
                                . Please answer all questions before submitting.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="font-medium text-emerald-400">
                                All Questions Answered
                            </p>

                            <p className="mt-2 text-sm text-foreground">
                                Once you submit the quiz, you won't be able to modify your answers.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-border px-6 py-5">
                    {hasUnanswered ? (
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-primary hover:bg-orange-600 text-foreground font-semibold"
                        >
                            Back to Questions
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="bg-slate-700 hover:bg-muted"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={onConfirm}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Quiz"}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}