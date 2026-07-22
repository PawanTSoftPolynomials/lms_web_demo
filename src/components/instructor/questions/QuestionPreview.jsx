"use client";

import {
    FaQuestionCircle,
    FaCheckCircle,
    FaStar,
} from "react-icons/fa";

export default function QuestionPreview({
                                            question,
                                        }) {
    if (!question) return null;

    return (
        <div className="space-y-8">
            {/* Question */}
            <div
                className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-8
                "
            >
                <div className="mb-5 flex items-center gap-3">
                    <FaQuestionCircle className="text-xl text-orange-400" />

                    <h2 className="text-2xl font-semibold">
                        Question
                    </h2>
                </div>

                <p className="text-lg leading-8 text-white">
                    {question.question}
                </p>
            </div>

            {/* Options */}
            <div
                className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-8
                "
            >
                <h2 className="mb-6 text-2xl font-semibold">
                    Answer Options
                </h2>

                <div className="space-y-4">
                    {Array.isArray(question.options) &&
                        question.options.map(
                            (option, index) => {
                                const isCorrect =
                                    option ===
                                    question.correctAnswer;

                                return (
                                    <div
                                        key={index}
                                        className={`
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            p-5
                                            transition
                                            ${
                                            isCorrect
                                                ? "border-green-500 bg-green-500/10"
                                                : "border-slate-800 bg-slate-950"
                                        }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={`
                                                    flex
                                                    h-10
                                                    w-10
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    font-semibold
                                                    ${
                                                    isCorrect
                                                        ? "bg-green-500 text-white"
                                                        : "bg-slate-800 text-slate-300"
                                                }
                                                `}
                                            >
                                                {String.fromCharCode(
                                                    65 + index
                                                )}
                                            </span>

                                            <span className="text-white">
                                                {option}
                                            </span>
                                        </div>

                                        {isCorrect && (
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-full
                                                    bg-green-500/15
                                                    px-3
                                                    py-1
                                                    text-sm
                                                    font-medium
                                                    text-green-400
                                                "
                                            >
                                                <FaCheckCircle />
                                                Correct
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        )}
                </div>
            </div>

            {/* Marks */}
            <div
                className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-8
                "
            >
                <div className="flex items-center gap-3">
                    <FaStar className="text-xl text-orange-400" />

                    <h2 className="text-2xl font-semibold">
                        Marks
                    </h2>
                </div>

                <p className="mt-5 text-4xl font-bold text-orange-400">
                    {question.marks}
                </p>
            </div>
        </div>
    );
}