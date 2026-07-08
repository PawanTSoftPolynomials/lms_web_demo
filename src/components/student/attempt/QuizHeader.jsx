"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

export default function QuizHeader({
                                       quiz,
                                   }) {
    if (!quiz) return null;

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
                <Link
                    href="/student/quizzes"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-orange-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quizzes
                </Link>

                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
                        <ClipboardCheck className="h-6 w-6" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {quiz.title}
                        </h1>

                        <p className="mt-1 text-slate-400">
                            {quiz.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-800 px-5 py-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Questions
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {quiz.questions?.length ?? 0}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-800 px-5 py-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Pass Score
                    </p>

                    <p className="mt-2 text-2xl font-bold text-orange-400">
                        {quiz.passingScore}%
                    </p>
                </div>

                <div className="rounded-xl bg-slate-800 px-5 py-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Duration
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {quiz.timeLimit} min
                    </p>
                </div>
            </div>
        </div>
    );
}