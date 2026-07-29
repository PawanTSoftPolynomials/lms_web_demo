"use client";

import QuizRow from "./QuizRow";
import QuizCard from "./QuizCard";

export default function QuizTable({ quizzes = [] }) {
  if (!quizzes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center">
        <h3 className="text-base sm:text-lg font-bold text-white">
          No quizzes available
        </h3>
        <p className="mt-1.5 text-xs text-slate-400">
          There are currently no quizzes assigned to you under this tab.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* MOBILE CARD VIEW (< md) */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-800/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-300">
                  Quiz
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-300">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-300">
                  Passing Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-300">
                  Time Limit
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-300">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quizzes.map((quiz) => (
                <QuizRow key={quiz.id} quiz={quiz} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}