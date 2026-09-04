"use client";

import QuizRow from "./QuizRow";
import QuizCard from "./QuizCard";

export default function QuizTable({ quizzes = [] }) {
  if (!quizzes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/60 p-8 sm:p-12 text-center">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          No quizzes available
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground">
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
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-background shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black text-left">
                <th className="px-6 py-4 font-medium">
                  Quiz
                </th>
                <th className="px-6 py-4 font-medium">
                  Questions
                </th>
                <th className="px-6 py-4 font-medium">
                  Passing Score
                </th>
                <th className="px-6 py-4 font-medium">
                  Time Limit
                </th>
                <th className="px-6 py-4 font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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