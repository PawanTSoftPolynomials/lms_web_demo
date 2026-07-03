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

    const unansweredQuestions =
        totalQuestions - answeredQuestions;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                {/* Header */}
                <div className="border-b border-slate-800 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">
                        Submit Quiz
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Please review your quiz before submitting.
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-slate-800 p-4 text-center">
                            <p className="text-sm text-slate-400">
                                Questions
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {totalQuestions}
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-500/10 p-4 text-center">
                            <p className="text-sm text-slate-400">
                                Answered
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-400">
                                {answeredQuestions}
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-500/10 p-4 text-center">
                            <p className="text-sm text-slate-400">
                                Remaining
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-400">
                                {unansweredQuestions}
                            </p>
                        </div>
                    </div>

                    {unansweredQuestions > 0 && (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                            <p className="font-medium text-yellow-400">
                                Warning
                            </p>

                            <p className="mt-2 text-sm text-slate-300">
                                You still have{" "}
                                <strong>
                                    {unansweredQuestions}
                                </strong>{" "}
                                unanswered{" "}
                                {unansweredQuestions === 1
                                    ? "question"
                                    : "questions"}
                                . They will be submitted as unanswered.
                            </p>
                        </div>
                    )}

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-slate-300">
                            Once you submit the quiz, you
                            won't be able to modify your
                            answers.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-slate-700 hover:bg-slate-600"
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
                </div>
            </div>
        </div>
    );
}