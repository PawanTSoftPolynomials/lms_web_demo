"use client";

import QuizRow from "./QuizRow";

export default function QuizTable({
                                      quizzes = [],
                                  }) {
    if (!quizzes.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">
                <h3 className="text-xl font-semibold text-white">
                    No quizzes available
                </h3>

                <p className="mt-2 text-slate-400">
                    There are currently no quizzes assigned to you.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-800/60">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                            Quiz
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                            Questions
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                            Passing Score
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                            Time Limit
                        </th>

                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                            Action
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {quizzes.map((quiz) => (
                        <QuizRow
                            key={quiz.id}
                            quiz={quiz}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}