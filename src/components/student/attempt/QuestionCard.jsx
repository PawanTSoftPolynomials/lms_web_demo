"use client";

import OptionList from "./OptionList";

export default function QuestionCard({
                                         question,
                                         currentQuestion,
                                         totalQuestions,
                                         selectedAnswer,
                                         onSelectAnswer,
                                     }) {
    if (!question) return null;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {/* Question Progress */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-400">
                        Question {currentQuestion} of {totalQuestions}
                    </p>

                    <div className="mt-3 h-2 w-56 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-300"
                            style={{
                                width: `${
                                    (currentQuestion /
                                        totalQuestions) *
                                    100
                                }%`,
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                    {question.marks} Marks
                </div>
            </div>

            {/* Question */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold leading-relaxed text-white">
                    {question.question}
                </h2>
            </div>

            {/* Options */}
            <OptionList
                options={question.options}
                selectedAnswer={selectedAnswer}
                onSelect={onSelectAnswer}
            />
        </div>
    );
}