"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";

export default function QuizTable({ quizzes = [] }) {
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Recent Quizzes
          </h2>

          <p className="mt-1 text-slate-400">
            Review quiz performance.
          </p>
        </div>

        <Link
          href="/instructor/quizzes"
          className="text-sm font-medium text-orange-400 hover:text-orange-300"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-700">
            <tr className="text-left text-sm text-slate-400">
              <th className="pb-4">Quiz</th>
              <th className="pb-4">Course</th>
              <th className="pb-4">Attempts</th>
              <th className="pb-4">Average</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {quizzes.map((quiz) => (
              <tr
                key={quiz.id}
                className="border-b border-slate-800 last:border-none"
              >
                <td className="py-5 font-semibold text-white">
                  {quiz.title}
                </td>

                <td className="text-slate-300">
                  {quiz.course}
                </td>

                <td>{quiz.attempts}</td>

                <td>{quiz.averageScore}%</td>

                <td className="text-right">
                  <Link
                    href={`/instructor/quizzes/${quiz.id}`}
                    className="font-medium text-orange-400 hover:text-orange-300"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}