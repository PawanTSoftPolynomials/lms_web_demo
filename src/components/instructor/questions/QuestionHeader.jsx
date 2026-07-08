"use client";

import Link from "next/link";

import {
    FaQuestionCircle, FaPlus, FaArrowLeft,
} from "react-icons/fa";

import Card from "@/components/ui/Card";

export default function QuestionHeader({
                                           quiz,
                                       }) {
    return (<Card className="overflow-hidden">
        <div className="space-y-8">
            {/* Back */}
            <Link
                href={`/instructor/quizzes/view/${quiz.quizId || quiz.id}`}
                className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-400
                        transition
                        hover:text-orange-400
                    "
            >
                <FaArrowLeft size={14}/>
                Back to Quiz
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-5">
                    <div
                        className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-orange-500/15
                                text-orange-400
                            "
                    >
                        <FaQuestionCircle size={28}/>
                    </div>

                    <div>
                            <span
                                className="
                                    inline-flex
                                    rounded-full
                                    bg-orange-500/15
                                    px-3
                                    py-1
                                    text-xs
                                    font-medium
                                    text-orange-400
                                "
                            >
                                Questions
                            </span>

                        <h1 className="mt-4 text-4xl font-bold text-white">
                            Manage Questions
                        </h1>

                        <p className="mt-3 max-w-3xl text-slate-400">
                            Create, edit and organize questions for this
                            quiz. Each question can contain multiple
                            options, a correct answer and marks.
                        </p>
                    </div>
                </div>

                <Link
                    href={`/instructor/questions/create/${quiz.id}`}
                    className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-orange-600
                            px-5
                            py-3
                            font-medium
                            text-white
                            transition
                            hover:bg-orange-700
                        "
                >
                    <FaPlus size={14}/>
                    Add Question
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-5 md:grid-cols-3">
                <div
                    className="
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-5
                        "
                >
                    <p className="text-sm text-slate-400">
                        Total Questions
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-white">
                        {quiz.questions?.length || 0}
                    </h3>
                </div>

                <div
                    className="
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-5
                        "
                >
                    <p className="text-sm text-slate-400">
                        Passing Score
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-orange-400">
                        {quiz.passingScore}%
                    </h3>
                </div>

                <div
                    className="
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-5
                        "
                >
                    <p className="text-sm text-slate-400">
                        Time Limit
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-blue-400">
                        {quiz.timeLimit || 0} min
                    </h3>
                </div>
            </div>
        </div>
    </Card>);
}