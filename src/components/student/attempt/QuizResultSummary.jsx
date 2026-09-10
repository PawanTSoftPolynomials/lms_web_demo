"use client";

import Link from "next/link";
import { Award, ArrowRight, CheckCircle2 } from "lucide-react";

import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";

/**
 * Shown in place of the question UI once a quiz has been submitted — an
 * inline "you're done" summary instead of redirecting away from the content
 * player, with the full report and moving on to the next content block both
 * left as explicit choices rather than forced navigation.
 */
export default function QuizResultSummary({
    quizTitle,
    isLoading,
    correctCount,
    totalQuestions,
    percentage,
    passed,
    resultHref,
    onNextContent,
}) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-background p-8">
                <Loader />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 text-center">
            <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                    passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}
            >
                <Award className="h-7 w-7" />
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-semibold">
                    {quizTitle ? `"${quizTitle}" submitted` : "Quiz submitted"}
                </p>
            </div>

            <div
                className={`mx-auto mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    passed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                }`}
            >
                {passed ? "Passed" : "Failed"}
            </div>

            <div className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[11px] text-muted-foreground">Correct Answers</p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                        {correctCount} <span className="text-sm font-normal text-muted-foreground">/ {totalQuestions}</span>
                    </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[11px] text-muted-foreground">Score</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{percentage}%</p>
                </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
                <Link href={resultHref} className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                        View Full Result
                    </Button>
                </Link>

                {onNextContent && (
                    <Button
                        type="button"
                        onClick={onNextContent}
                        className="flex flex-1 items-center justify-center gap-2"
                    >
                        Next Content
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
