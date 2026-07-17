"use client";

import Link from "next/link";
import {
    Clock,
    HelpCircle,
    Target,
    PlayCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";

export default function QuizRow({
                                    quiz,
                                }) {
    const submission = quiz.quizSubmissions?.[0];
    const hasSubmitted = !!submission;
    const passed = submission?.passed;

    return (
        <tr className="border-b border-slate-800 transition hover:bg-slate-800/40">
            {/* Quiz */}
            <td className="px-6 py-5">
                <div>
                    <h3 className="font-semibold text-white">
                        {quiz.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {quiz.description}
                    </p>
                </div>
            </td>

            {/* Questions */}
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-300">
                    <HelpCircle className="h-4 w-4 text-orange-500"/>

                    <span>
            {quiz._count?.questions ?? 0}
          </span>
                </div>
            </td>

            {/* Passing Score */}
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-300">
                    <Target className="h-4 w-4 text-orange-500"/>

                    <span>
            {quiz.passingScore}%
          </span>
                </div>
            </td>

            {/* Time */}
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-orange-500"/>

                    <span>
            {quiz.timeLimit} min
          </span>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-5">
                {hasSubmitted ? (
                    passed ? (
                        <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-500"/>
                            <span>Passed ({submission.percentage}%)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-rose-500 font-medium text-sm">
                            <XCircle className="h-4 w-4 text-rose-500"/>
                            <span>Failed ({submission.percentage}%)</span>
                        </div>
                    )
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                        <HelpCircle className="h-4 w-4 text-slate-500"/>
                        <span>Not Attempted</span>
                    </div>
                )}
            </td>

            {/* Action */}
            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                    {hasSubmitted && (
                        <Link href={`/student/result/${quiz.id}`}>
                            <Button variant="secondary" className="px-3 py-1.5 text-xs">
                                View Result
                            </Button>
                        </Link>
                    )}
                    <Link
                        href={`/student/attempt/${quiz.id}`}
                    >
                        <Button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                            <PlayCircle className="h-3.5 w-3.5"/>
                            {hasSubmitted ? "Reattempt" : "Start Quiz"}
                        </Button>
                    </Link>
                </div>
            </td>
        </tr>
    );
}