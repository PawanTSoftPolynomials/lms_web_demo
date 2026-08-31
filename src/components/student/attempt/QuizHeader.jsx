"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

import QuizTimer from "@/components/student/attempt/QuizTimer";

export default function QuizHeader({
                                       quiz,
                                       onBack,
                                       onTimeUp,
                                   }) {
    if (!quiz) return null;

    const questionCount = quiz.questions?.length ?? 0;

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
                    Quiz Assessment &bull; {questionCount}{" "}
                    {questionCount === 1 ? "Question" : "Questions"}
                </p>
            </div>

            <div className="shrink-0 border-l border-border pl-3">
                <QuizTimer
                    duration={quiz?.timeLimit || quiz?.duration || 15}
                    onTimeUp={onTimeUp}
                />
            </div>
        </div>
    );
}
