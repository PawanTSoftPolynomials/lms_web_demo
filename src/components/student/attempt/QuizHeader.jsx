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
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
                {onBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-orange-400 cursor-pointer bg-transparent border-0 outline-none min-h-[28px]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Lesson
                    </button>
                ) : (
                    <Link
                        href="/student/quizzes"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-orange-400"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Quizzes
                    </Link>
                )}

                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                            {quiz.title}
                        </h1>

                        <p className="text-xs text-slate-400">
                            Quiz Assessment &bull; {questionCount}{" "}
                            {questionCount === 1 ? "Question" : "Questions"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="shrink-0 sm:border-l sm:border-slate-800 sm:pl-5">
                <QuizTimer
                    duration={quiz?.timeLimit || quiz?.duration || 15}
                    onTimeUp={onTimeUp}
                />
            </div>
        </div>
    );
}
