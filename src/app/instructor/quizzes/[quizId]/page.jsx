"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Edit3,
  Pencil,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { getQuizById, updateQuiz } from "@/services/quiz.service";
import {
  removeQuestionFromQuiz,
  reorderQuizQuestions,
  updateQuizQuestionMarks,
} from "@/services/questionRepository.service";

export default function InstructorQuizDetailPage({ params }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizId;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [editingMarksId, setEditingMarksId] = useState(null);
  const [marksValue, setMarksValue] = useState("");

  const fetchQuizDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuizById(quizId);
      if (data) setQuiz(data);
    } catch (err) {
      console.error("Error fetching quiz details:", err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  // Remove question from quiz
  const handleRemoveQuestion = async (questionId) => {
    if (!confirm("Remove this question from the quiz? It will remain in your Question Repository.")) return;
    try {
      await removeQuestionFromQuiz(quizId, questionId);
      setFeedbackMessage("Question removed from quiz.");
      fetchQuizDetails();
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      alert("Failed to remove question: " + (err?.message || "Server error"));
    }
  };

  // Move question up/down
  const handleMoveQuestion = async (idx, direction) => {
    if (!quiz || !quiz.questions) return;

    const questions = [...quiz.questions];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const temp = questions[idx];
    questions[idx] = questions[targetIdx];
    questions[targetIdx] = temp;

    // Optimistic UI update
    setQuiz((prev) => ({ ...prev, questions }));

    try {
      const orderedIds = questions.map((q) => q.id);
      await reorderQuizQuestions(quizId, orderedIds);
    } catch {
      fetchQuizDetails();
    }
  };

  // Update marks override
  const handleSaveMarks = async (questionId) => {
    const num = parseInt(marksValue, 10);
    if (isNaN(num) || num <= 0) return;

    try {
      await updateQuizQuestionMarks(quizId, questionId, num);
      setEditingMarksId(null);
      fetchQuizDetails();
    } catch (err) {
      alert("Failed to update marks: " + (err?.message || "Server error"));
    }
  };

  // Toggle publish status
  const handleTogglePublish = async () => {
    if (!quiz) return;
    const newIsPublished = !quiz.isPublished;
    const newStatus = newIsPublished ? "PUBLISHED" : "DRAFT";
    try {
      await updateQuiz(quizId, { isPublished: newIsPublished, status: newStatus });
      setFeedbackMessage(`Quiz status updated to ${newStatus}.`);
      fetchQuizDetails();
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      alert("Failed to update quiz status: " + (err?.message || "Server error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-10 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm text-slate-400">Loading Quiz Details...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-10 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Quiz Not Found</h2>
        <Link href="/instructor/courses" className="text-amber-400 text-xs underline">
          Return to Courses
        </Link>
      </div>
    );
  }

  const totalMarks = (quiz.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${quiz.isPublished ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                {quiz.isPublished ? "PUBLISHED" : "DRAFT"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mt-1">{quiz.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{quiz.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Quiz Metadata Summary Bar */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-center md:text-left">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Questions</span>
              <p className="text-xl font-bold text-amber-400">{quiz.questions ? quiz.questions.length : 0}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Total Marks</span>
              <p className="text-xl font-bold text-sky-400">{totalMarks}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Duration</span>
              <p className="text-xl font-bold text-emerald-400">{quiz.timeLimit || 30} mins</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Passing Score</span>
              <p className="text-xl font-bold text-purple-400">{quiz.passingScore || 60}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <Link
              href={`/instructor/questions/create/${quizId}`}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Question</span>
            </Link>

            <Link
              href={`/instructor/quizzes/${quizId}/import-questions`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Import From Repository</span>
            </Link>

            <button
              onClick={handleTogglePublish}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                quiz.isPublished
                  ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
              }`}
            >
              {quiz.isPublished ? "Unpublish (Draft)" : "Publish Quiz"}
            </button>
          </div>
        </div>

        {/* Questions Builder & Reordering List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Quiz Questions ({quiz.questions ? quiz.questions.length : 0})</span>
            </h3>

            <Link
              href={`/instructor/quizzes/${quizId}/import-questions`}
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Questions</span>
            </Link>
          </div>

          {!quiz.questions || quiz.questions.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-200">No Questions in Quiz Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Import questions from your centralized Question Repository to build this quiz.
              </p>
              <Link
                href={`/instructor/quizzes/${quizId}/import-questions`}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Import Questions From Repository</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quiz.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {q.questionType || q.type || "MCQ"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono">
                            {q.difficulty || "MEDIUM"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{q.title || q.question}</h4>
                        <p className="text-xs text-slate-400 mt-1">{q.question}</p>
                      </div>
                    </div>

                    {/* Controls & Marks Edit */}
                    <div className="flex items-center space-x-3 shrink-0">
                      {editingMarksId === q.id ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="1"
                            value={marksValue}
                            onChange={(e) => setMarksValue(e.target.value)}
                            className="w-16 bg-slate-950 border border-amber-500 text-white rounded px-2 py-1 text-xs font-mono font-bold focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveMarks(q.id)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingMarksId(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 group">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {q.marks || 1} pts
                          </span>
                          <button
                            onClick={() => {
                              setEditingMarksId(q.id);
                              setMarksValue(String(q.marks || 1));
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 transition"
                            title="Override Marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
                        <Link
                          href={`/instructor/questions/edit/${q.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400"
                          title="Edit Question"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleMoveQuestion(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Question Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleMoveQuestion(idx, 1)}
                          disabled={idx === quiz.questions.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Question Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 ml-1"
                          title="Remove from Quiz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
