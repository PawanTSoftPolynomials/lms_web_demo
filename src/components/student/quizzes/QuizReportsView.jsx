"use client";

import Link from "next/link";

export default function QuizReportsView({ reportStats, filteredByCourse }) {
  const completedQuizzes = filteredByCourse.filter((q) => !!q.quizSubmissions?.[0]);

  return (
    <div className="space-y-5">
      {/* Report Metrics */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Passed</p>
          <h4 className="text-base sm:text-lg font-black text-emerald-400 mt-1">{reportStats.passedCount}</h4>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Failed</p>
          <h4 className="text-base sm:text-lg font-black text-rose-400 mt-1">{reportStats.failedCount}</h4>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Avg Score</p>
          <h4 className="text-base sm:text-lg font-black text-purple-400 mt-1">{reportStats.avgScore}%</h4>
        </div>
      </div>

      {/* Reports List */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
          Quiz Attempt Reports
        </h3>

        {/* MOBILE CARDS (< md) FOR REPORTS */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {completedQuizzes.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
              No quiz attempts found.
            </div>
          ) : (
            completedQuizzes.map((quiz) => {
              const submission = quiz.quizSubmissions[0];
              return (
                <div key={quiz.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-extrabold text-white">{quiz.title}</h4>
                    <span className={`inline-flex rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                      submission.passed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {submission.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/50 font-mono">
                    <span>Date: {new Date(submission.createdAt).toLocaleDateString()}</span>
                    <span className="font-extrabold text-white">Score: {submission.score}/{quiz._count?.questions ?? 10} ({submission.percentage}%)</span>
                  </div>
                  <Link href={`/student/result/${quiz.id}`} className="block pt-1">
                    <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-extrabold min-h-[44px]">
                      View Result
                    </button>
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE (>= md) FOR REPORTS */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-3">Quiz</th>
                <th className="pb-3 text-center w-36">Attempt Date</th>
                <th className="pb-3 text-center w-28">Score</th>
                <th className="pb-3 w-32">Status</th>
                <th className="pb-3 text-right pr-3 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {completedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                    No quiz attempts found.
                  </td>
                </tr>
              ) : (
                completedQuizzes.map((quiz) => {
                  const submission = quiz.quizSubmissions[0];
                  return (
                    <tr key={quiz.id} className="hover:bg-slate-800/20 transition border-b border-slate-800/40">
                      <td className="py-3.5 pl-3">
                        <span className="font-extrabold text-white">{quiz.title}</span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-400 text-xs">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-center text-slate-300 font-extrabold text-xs">
                        {submission.score}/{quiz._count?.questions ?? 10} ({submission.percentage}%)
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                          submission.passed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {submission.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <Link href={`/student/result/${quiz.id}`}>
                          <button className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 border border-slate-700/60 rounded-xl transition cursor-pointer min-h-[44px]">
                            View Result
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
