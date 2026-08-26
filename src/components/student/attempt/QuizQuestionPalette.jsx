"use client";

import { LayoutGrid, Send } from "lucide-react";

import Button from "@/components/ui/Button";

const STATUS_STYLES = {
    current:
        "border-orange-500 bg-orange-500 text-white shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
    answered:
        "border-emerald-500/60 bg-emerald-500/15 text-emerald-400 hover:border-emerald-400",
    visited:
        "border-amber-500/60 bg-amber-500/15 text-amber-400 hover:border-amber-400",
    unvisited:
        "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200",
};

const LEGEND_ITEMS = [
    { key: "answered", label: "Answered", dotClass: "bg-emerald-500" },
    { key: "visited", label: "Skipped", dotClass: "bg-amber-500" },
    { key: "unvisited", label: "Not Visited", dotClass: "bg-slate-600" },
];

/**
 * Question overview + jump-to-question palette shown alongside the active
 * question during a quiz attempt, so the student can see attempt progress
 * across every question and submit at any point (not only on the last one).
 */
export default function QuizQuestionPalette({
    questions = [],
    currentQuestionIndex = 0,
    answers = {},
    visitedIndices,
    onJumpTo,
    onSubmit,
    isSubmitting = false,
}) {
    const statusFor = (index, questionId) => {
        if (index === currentQuestionIndex) return "current";
        if (answers[questionId] !== undefined) return "answered";
        if (visitedIndices?.has(index)) return "visited";
        return "unvisited";
    };

    const statusCounts = questions.reduce(
        (counts, question, index) => {
            const status = statusFor(index, question.id);
            counts[status] += 1;
            return counts;
        },
        { current: 0, answered: 0, visited: 0, unvisited: 0 }
    );

    const answeredCount = Object.keys(answers).length;

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-orange-500" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Question Overview
                </h3>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                {questions.map((question, index) => (
                    <button
                        key={question.id ?? index}
                        type="button"
                        onClick={() => onJumpTo?.(index)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition cursor-pointer ${
                            STATUS_STYLES[
                                statusFor(index, question.id)
                            ]
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4">
                {LEGEND_ITEMS.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center justify-between gap-2 text-xs text-slate-400"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`}
                            />
                            {item.label}
                        </span>

                        <span className="font-semibold text-slate-300">
                            {statusCounts[item.key]}
                        </span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-slate-500">
                {answeredCount} of {questions.length} answered
            </p>

            <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
                <Send className="h-4 w-4" />
                Submit & End Quiz
            </Button>
        </div>
    );
}
