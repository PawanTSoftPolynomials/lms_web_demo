"use client";

import Link from "next/link";
import {
    Clock,
    HelpCircle,
    Target,
    PlayCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";

export default function QuizRow({
                                    quiz,
                                }) {
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

            {/* Action */}
            <td className="px-6 py-5 text-right">
                <Link
                    href={`/student/attempt/${quiz.id}`}
                >
                    <Button className="inline-flex items-center gap-2">
                        <PlayCircle className="h-4 w-4"/>
                        Start Quiz
                    </Button>
                </Link>
            </td>
        </tr>
    );
}