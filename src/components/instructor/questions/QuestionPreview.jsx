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
                    {/* MCQ_SINGLE / MCQ_MULTI */}
                    {(question.type === "MCQ_SINGLE" || question.type === "MCQ_MULTI" || !question.type) &&
                        Array.isArray(question.options) &&
                        question.options.map((option, index) => {
                            const isCorrect = question.type === "MCQ_SINGLE"
                                ? option === question.correctAnswer
                                : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option);

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
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="text-white">{option}</span>
                                    </div>

                                    {isCorrect && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-400">
                                            <FaCheckCircle />
                                            Correct Choice
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                    {/* ARRANGE_TOKENS */}
                    {question.type === "ARRANGE_TOKENS" && Array.isArray(question.options) && (
                        <div className="flex flex-wrap gap-2.5">
                            {question.options.map((token, index) => (
                                <span
                                    key={index}
                                    className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
                                >
                                    <span className="text-[10px] bg-orange-500/20 px-1 rounded">{index + 1}</span>
                                    {token}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* MATCH_PAIRS */}
                    {question.type === "MATCH_PAIRS" && question.correctAnswer && (
                        <div className="grid gap-3">
                            {Object.entries(question.correctAnswer).map(([leftItem, rightItem], index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                                >
                                    <span className="font-semibold text-white">{leftItem}</span>
                                    <span className="text-slate-500 font-bold font-mono">⟷</span>
                                    <span className="text-emerald-400 font-bold">{rightItem}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SELF_ASSESSMENT */}
                    {question.type === "SELF_ASSESSMENT" && (
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
                                Grading Rubric
                            </span>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {question.correctAnswer}
                            </p>
                        </div>
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