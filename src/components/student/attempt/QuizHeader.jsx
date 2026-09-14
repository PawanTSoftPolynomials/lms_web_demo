"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import QuizTimer, { getQuizTimerStorageKey } from "@/components/student/attempt/QuizTimer";

export default function QuizHeader({
                                       quiz,
                                       onBack,
                                       onTimeUp,
                                       answeredCount = 0,
                                   }) {
    if (!quiz) return null;

    const questionCount = quiz.questions?.length ?? 0;
    const unansweredCount = Math.max(0, questionCount - answeredCount);

    // No fallback duration. A quiz with no time limit is untimed — inventing
    // one here would start a countdown that force-submits the attempt.
    const timeLimit = Number(quiz.timeLimit) > 0 ? Number(quiz.timeLimit) : null;

    const quizTypeLabel = quiz.quizTag === "SELF_TEST" ? "Self-Test" : "Final Quiz";

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/80 px-4 py-2.5">
            {onBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    title="Back to Lesson"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary cursor-pointer bg-transparent border-0 outline-none"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
            ) : (
                <Link
                    href="/student/quizzes"
                    title="Back to Quizzes"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            )}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <h1 className="truncate text-h2 text-foreground">
                    {quiz.title}
                </h1>

                <p className="text-[11px] text-muted-foreground">
                    {quizTypeLabel} &bull; {questionCount}{" "}
                    {questionCount === 1 ? "Question" : "Questions"}
                    {timeLimit === null && <> &bull; No timer</>}
                </p>
            </div>

            <div className="hidden shrink-0 items-center gap-3 border-l border-border pl-3 sm:flex">
                <div className="text-center">
                    <p className="text-[11px] text-muted-foreground">Answered</p>
                    <p className="text-sm font-bold text-emerald-400">{answeredCount}</p>
                </div>

                <div className="text-center">
                    <p className="text-[11px] text-muted-foreground">Unanswered</p>
                    <p className="text-sm font-bold text-amber-400">{unansweredCount}</p>
                </div>
            </div>

            {timeLimit !== null && (
                <div className="shrink-0 border-l border-border pl-3">
                    <QuizTimer
                        duration={timeLimit}
                        storageKey={getQuizTimerStorageKey(
                            quiz.id,
                            quiz.attemptStatus?.attemptsUsed ?? 0
                        )}
                        onTimeUp={onTimeUp}
                    />
                </div>
            )}
        </div>
    );
}
