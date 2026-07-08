"use client";

import Link from "next/link";
import { FaClock, FaQuestionCircle } from "react-icons/fa";

import Button from "@/components/ui/Button";

export default function QuizHeader({
                                       quiz,
                                   }) {
    return (
        <div
            className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-8
      "
        >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                {/* Left */}
                <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
                className="
                rounded-full
                bg-orange-500/15
                px-3
                py-1
                text-sm
                font-medium
                text-orange-400
              "
            >
              Quiz
            </span>

                        <span
                            className="
                rounded-full
                bg-blue-500/15
                px-3
                py-1
                text-sm
                text-blue-400
              "
                        >
              {quiz.isPublished
                  ? "Published"
                  : "Draft"}
            </span>
                    </div>

                    <h1 className="text-4xl font-bold text-white">
                        {quiz.title}
                    </h1>

                    <p className="mt-4 max-w-4xl text-slate-400">
                        {quiz.description ||
                            "No description available."}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-500/15
                  text-orange-400
                "
                            >
                                <FaClock />
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Duration
                                </p>

                                <p className="font-semibold text-white">
                                    {quiz.duration} min
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-500/15
                  text-green-400
                "
                            >
                                <FaQuestionCircle />
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Passing Marks
                                </p>

                                <p className="font-semibold text-white">
                                    {quiz.passingMarks}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="flex gap-3">
                    <Link
                        href={`/instructor/quizzes/edit/${quiz.id}`}
                    >
                        <Button
                            variant="outline"
                            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                        >
                            Edit Quiz
                        </Button>
                    </Link>

                    <Link
                        href={`/instructor/questions/${quiz.id}`}
                    >
                        <Button>
                            Manage Questions
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}