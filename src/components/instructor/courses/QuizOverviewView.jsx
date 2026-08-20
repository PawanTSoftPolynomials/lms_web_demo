"use client";

import React from "react";
import { HelpCircle, Clock, CheckCircle2, Award, AlertCircle, FileText, Check, ListChecks } from "lucide-react";

export function QuizOverviewView({ quiz, moduleTitle = null }) {
  if (!quiz) {
    return (
      <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center shadow-md space-y-3">
        <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-300">Quiz Not Found</h3>
        <p className="text-xs text-slate-500">Select a quiz from the Course Map on the left to view details.</p>
      </div>
    );
  }

  // Normalize questions array (from draft format `quiz.questions` or DB format `quiz.quizQuestions`)
  const questions = (quiz.questions || (quiz.quizQuestions || []).map((qq) => ({
    ...qq.question,
    marks: qq.marks || qq.question?.marks || 1,
    order: qq.order,
  }))) || [];

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  const passingScore = quiz.passingScore !== undefined && quiz.passingScore !== null ? quiz.passingScore : 50;
  const timeLimit = quiz.timeLimit ? `${quiz.timeLimit} mins` : "No limit";
  const isPublished = quiz.isPublished !== false;

  return (
    <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-6">
      {/* Cell Header Badge */}
      <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <HelpCircle size={12} />
            {moduleTitle ? `Module Quiz — ${moduleTitle}` : "Course-Level Quiz"}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {questions.length} {questions.length === 1 ? "Question" : "Questions"}
        </span>
      </div>

      {/* Quiz Overview Details */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">{quiz.title || "Untitled Quiz"}</h2>
        {quiz.description && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {quiz.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-medium text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ListChecks size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Questions</span>
              <span className="font-bold text-white text-sm">{questions.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Award size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Marks</span>
              <span className="font-bold text-white text-sm">{totalMarks} pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Passing Score</span>
              <span className="font-bold text-white text-sm">{passingScore}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Time Limit</span>
              <span className="font-bold text-white text-sm">{timeLimit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText size={16} className="text-emerald-400" />
          <span>Quiz Questions ({questions.length})</span>
        </h3>

        {questions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800/80">
            No questions added to this quiz yet.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const qType = (q.questionType || q.type || "MCQ_SINGLE").toUpperCase();
              const options = Array.isArray(q.options)
                ? q.options
                : (typeof q.options === "object" && q.options !== null ? Object.values(q.options) : []);

              const correctAnswerStr = typeof q.correctAnswer === "string" || typeof q.correctAnswer === "number"
                ? String(q.correctAnswer)
                : JSON.stringify(q.correctAnswer || "");

              return (
                <div
                  key={q.id || `q-${idx}`}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                        {qType}
                      </span>
                      {q.difficulty && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold">
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">
                      {q.marks || 1} {q.marks === 1 ? "pt" : "pts"}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm font-semibold text-slate-100 leading-snug">{q.question || q.title}</h4>

                  {/* Options List if applicable */}
                  {options.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Options</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((opt, optIdx) => {
                          const isCorrect = correctAnswerStr.includes(String(opt)) || String(opt) === correctAnswerStr;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold"
                                  : "bg-slate-950 border-slate-800 text-slate-300"
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Non-MCQ Correct Answer Display */}
                  {options.length === 0 && q.correctAnswer !== undefined && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-emerald-400">Correct Answer:</span>
                      <span className="font-bold">{correctAnswerStr}</span>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                      <span className="font-mono text-[10px] uppercase text-slate-500 block">Explanation</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
