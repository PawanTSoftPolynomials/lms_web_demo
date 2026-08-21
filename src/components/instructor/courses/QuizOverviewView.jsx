"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  Award,
  FileText,
  Check,
  ListChecks,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from "lucide-react";

// Question.options (backend) may hold plain strings or richer
// { optionText, isCorrect?, misconceptionTag? } objects (see
// question.helper.js/QuestionUploadParser.js) — this editor only ever
// authors/edits plain strings, so every option gets reduced to its display
// text on load. Rendering one of those objects directly as a React child
// (e.g. `{opt}` in JSX) crashes with "Objects are not valid as a React
// child", which is what this normalization prevents.
function optionToText(opt) {
  if (opt && typeof opt === "object") return String(opt.optionText ?? opt.text ?? "");
  return String(opt ?? "");
}

export function QuizOverviewView({
  quiz,
  quizMode = "view",
  moduleTitle = null,
  lessonTitle = null,
  onSaveQuiz,
  onCancel,
  startEditing = false,
}) {
  const [isEditing, setIsEditing] = useState(startEditing || quizMode === "create" || quizMode === "edit");

  // Active single question index in editor mode (0-indexed) — view/preview
  // mode has no equivalent since it lists every question at once.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Editable Quiz Metadata
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isPublished: true,
  });

  // Editable Questions Array
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  // Sync state when quiz prop, quizMode, or startEditing changes
  useEffect(() => {
    if (quizMode === "create") {
      setIsEditing(true);
      setQuizForm({
        title: lessonTitle ? `Quiz - ${lessonTitle}` : moduleTitle ? `Quiz - ${moduleTitle}` : "Module Quiz",
        description: "",
        timeLimit: 30,
        passingScore: 70,
        isPublished: true,
      });
      setQuestions([]);
      setCurrentQuestionIndex(0);
    } else if (startEditing || quizMode === "edit") {
      setIsEditing(true);
    }
  }, [quizMode, startEditing, moduleTitle, lessonTitle]);

  useEffect(() => {
    if (quiz && quizMode !== "create") {
      setQuizForm({
        title: quiz.title || "",
        description: quiz.description || "",
        timeLimit: quiz.timeLimit !== undefined && quiz.timeLimit !== null ? quiz.timeLimit : 30,
        passingScore: quiz.passingScore !== undefined && quiz.passingScore !== null ? quiz.passingScore : 50,
        isPublished: quiz.isPublished !== false,
      });

      const rawQuestions = quiz.questions || (quiz.quizQuestions || []).map((qq) => ({
        ...qq.question,
        id: qq.question?.id || qq.id,
        marks: qq.marks || qq.question?.marks || 1,
        order: qq.order,
      })) || [];

      const normalized = rawQuestions.map((q, idx) => ({
        id: q.id || `draft-que-${quiz.id || "temp"}-${idx + 1}`,
        question: q.question || q.title || "",
        questionType: (q.questionType || q.type || "MCQ_SINGLE").toUpperCase(),
        options: Array.isArray(q.options)
          ? q.options.map(optionToText)
          : (typeof q.options === "object" && q.options !== null ? Object.values(q.options).map(optionToText) : ["Option 1", "Option 2"]),
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : "",
        explanation: q.explanation || "",
        marks: q.marks !== undefined ? Number(q.marks) : 1,
        difficulty: q.difficulty || "MEDIUM",
        isMandatory: q.isMandatory !== false,
      }));

      setQuestions(normalized);
      setCurrentQuestionIndex(0);
    }
  }, [quiz, quizMode]);

  if (!quiz && quizMode !== "create") {
    return (
      <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center shadow-md space-y-3">
        <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-300">Quiz Not Found</h3>
        <p className="text-xs text-slate-500">Select a quiz from the Course Map on the left to view details.</p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setError("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setError("");
    if (quizMode === "create") {
      onCancel?.();
    } else {
      setIsEditing(false);
      // Reset state to original quiz prop
      if (quiz) {
        setQuizForm({
          title: quiz.title || "",
          description: quiz.description || "",
          timeLimit: quiz.timeLimit !== undefined && quiz.timeLimit !== null ? quiz.timeLimit : 30,
          passingScore: quiz.passingScore !== undefined && quiz.passingScore !== null ? quiz.passingScore : 50,
          isPublished: quiz.isPublished !== false,
        });
      }
    }
  };

  // Add a new question to local edit state and jump to it
  const handleAddQuestion = () => {
    const newQId = `draft-que-${quiz?.id || "temp"}-${Date.now()}`;
    const newQuestionObj = {
      id: newQId,
      question: `New Question ${questions.length + 1}`,
      questionType: "MCQ_SINGLE",
      options: ["Option 1", "Option 2"],
      correctAnswer: "Option 1",
      explanation: "",
      marks: 1,
      difficulty: "MEDIUM",
      isMandatory: true,
    };

    setQuestions((prev) => [...prev, newQuestionObj]);
    setCurrentQuestionIndex(questions.length);
  };

  // Remove active question from local edit state
  const handleRemoveCurrentQuestion = () => {
    if (questions.length === 0) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== currentQuestionIndex));
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  // Field change for current question
  const handleCurrentQuestionChange = (field, value) => {
    setQuestions((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const target = { ...updated[currentQuestionIndex], [field]: value };

      // Type change defaults
      if (field === "questionType") {
        if (value === "TRUE_FALSE") {
          target.options = ["True", "False"];
          target.correctAnswer = "True";
        } else if (value === "MCQ_SINGLE" || value === "MCQ_MULTI") {
          if (!Array.isArray(target.options) || target.options.length < 2) {
            target.options = ["Option 1", "Option 2"];
          }
          if (value === "MCQ_SINGLE" && Array.isArray(target.correctAnswer)) {
            target.correctAnswer = target.correctAnswer[0] || target.options[0];
          }
        }
      }

      updated[currentQuestionIndex] = target;
      return updated;
    });
  };

  // Option text change for current question
  const handleOptionTextChange = (optIdx, text) => {
    setQuestions((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const q = { ...updated[currentQuestionIndex] };
      const newOpts = [...(q.options || [])];
      const oldVal = newOpts[optIdx];
      newOpts[optIdx] = text;
      q.options = newOpts;

      if (q.questionType === "MCQ_SINGLE" && q.correctAnswer === oldVal) {
        q.correctAnswer = text;
      } else if (q.questionType === "MCQ_MULTI" && Array.isArray(q.correctAnswer)) {
        q.correctAnswer = q.correctAnswer.map((ca) => (ca === oldVal ? text : ca));
      }

      updated[currentQuestionIndex] = q;
      return updated;
    });
  };

  // Add option to current question
  const handleAddOption = () => {
    setQuestions((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const q = { ...updated[currentQuestionIndex] };
      const opts = Array.isArray(q.options) ? [...q.options] : [];
      opts.push(`Option ${opts.length + 1}`);
      q.options = opts;
      updated[currentQuestionIndex] = q;
      return updated;
    });
  };

  // Remove option from current question
  const handleRemoveOption = (optIdx) => {
    setQuestions((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const q = { ...updated[currentQuestionIndex] };
      const opts = (q.options || []).filter((_, i) => i !== optIdx);
      q.options = opts;

      if (q.questionType === "MCQ_SINGLE" && !opts.includes(q.correctAnswer)) {
        q.correctAnswer = opts[0] || "";
      }
      updated[currentQuestionIndex] = q;
      return updated;
    });
  };

  // Toggle correct option for current question
  const handleToggleCorrectOption = (optVal) => {
    setQuestions((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const q = { ...updated[currentQuestionIndex] };

      if (q.questionType === "MCQ_SINGLE" || q.questionType === "TRUE_FALSE") {
        q.correctAnswer = optVal;
      } else if (q.questionType === "MCQ_MULTI") {
        const currentArr = Array.isArray(q.correctAnswer)
          ? q.correctAnswer
          : (typeof q.correctAnswer === "string" ? [q.correctAnswer] : []);

        if (currentArr.includes(optVal)) {
          q.correctAnswer = currentArr.filter((item) => item !== optVal);
        } else {
          q.correctAnswer = [...currentArr, optVal];
        }
      }

      updated[currentQuestionIndex] = q;
      return updated;
    });
  };

  // Save changes
  const handleSaveChanges = (e) => {
    if (e) e.preventDefault();

    if (!quizForm.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setError(`Question #${i + 1} cannot have empty question text.`);
        setCurrentQuestionIndex(i);
        return;
      }
    }

    const updatedQuiz = {
      ...quiz,
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      timeLimit: Number(quizForm.timeLimit) || 0,
      passingScore: Number(quizForm.passingScore) || 0,
      isPublished: quizForm.isPublished,
      questions: questions.map((q, idx) => ({
        ...q,
        order: idx + 1,
        marks: Number(q.marks) || 1,
      })),
    };

    onSaveQuiz?.(updatedQuiz);
    setIsEditing(false);
  };

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  const activeQuestion = questions[currentQuestionIndex] || null;

  return (
    <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-5">
      {/* Header Bar */}
      <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <HelpCircle size={12} />
            {lessonTitle ? `Lesson Quiz — ${lessonTitle}` : moduleTitle ? `Module Quiz — ${moduleTitle}` : "Course-Level Quiz"}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              quizForm.isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {quizForm.isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>

        {/* Action Controls: Edit Quiz / Save Changes & Cancel */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition cursor-pointer"
            >
              <Pencil size={14} />
              Edit Quiz
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Save size={14} />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---------------- VIEW / PREVIEW MODE (ONE QUESTION AT A TIME) ---------------- */}
      {!isEditing && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">{quiz?.title || quizForm.title || "Untitled Quiz"}</h2>
            {(quiz?.description || quizForm.description) && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {quiz?.description || quizForm.description}
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
                  <span className="font-bold text-white text-sm">{quizForm.passingScore}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Time Limit</span>
                  <span className="font-bold text-white text-sm">{quizForm.timeLimit ? `${quizForm.timeLimit} mins` : "No limit"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ALL QUESTIONS LIST */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {questions.length > 0 ? `${questions.length} Question${questions.length === 1 ? "" : "s"}` : "No Questions"}
            </span>

            {questions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800/80">
                No questions available to preview.
              </div>
            ) : (
              questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 space-y-3 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                        #{qIdx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10.5px] font-mono font-bold">
                        {q.questionType}
                      </span>
                      {q.difficulty && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10.5px] font-mono font-bold">
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      {q.marks || 1} {q.marks === 1 ? "pt" : "pts"}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm font-semibold text-white leading-relaxed pt-1">
                    {q.question}
                  </h4>

                  {/* Options List with Correct Answer Highlight */}
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Options:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.options.map((opt, optIdx) => {
                          const correctAnswerStr = typeof q.correctAnswer === "string" || typeof q.correctAnswer === "number"
                            ? String(q.correctAnswer)
                            : JSON.stringify(q.correctAnswer || "");
                          const isCorrect = correctAnswerStr.includes(String(opt)) || String(opt) === correctAnswerStr;

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold"
                                  : "bg-slate-950/80 border-slate-800/80 text-slate-300"
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <span className="text-[10.5px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                                  Correct Answer ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Non-MCQ Correct Answer Display */}
                  {(!Array.isArray(q.options) || q.options.length === 0) && q.correctAnswer && (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                      <span className="font-mono font-bold uppercase text-[10px] text-emerald-400 block">Correct Answer:</span>
                      <p className="font-semibold">{String(q.correctAnswer)}</p>
                    </div>
                  )}

                  {/* Explanation / Feedback */}
                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <span className="font-mono font-bold uppercase text-[10px] text-slate-500 block">Explanation:</span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- EDIT MODE (ONE QUESTION AT A TIME) ---------------- */}
      {isEditing && (
        <form onSubmit={handleSaveChanges} className="space-y-5">
          {/* Quiz Metadata Editing Header Block */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Quiz Settings</h3>
              <span className="text-[11px] font-mono text-slate-400">
                {questions.length} Questions • {totalMarks} Total Marks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Quiz Title *</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. C Programming Final Assessment"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Time (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm((prev) => ({ ...prev, timeLimit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Passing %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm((prev) => ({ ...prev, passingScore: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizForm.isPublished}
                      onChange={(e) => setQuizForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                      className="accent-emerald-500 h-3.5 w-3.5"
                    />
                    <span className="text-[10.5px] font-semibold text-slate-200">Published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={quizForm.description}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description / instructions..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* QUESTION NAVIGATION BAR (Top) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            {/* Left: Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || questions.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            {/* Center: Question Counter & Jump To Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-emerald-400">
                {questions.length > 0 ? `Question ${currentQuestionIndex + 1} of ${questions.length}` : "No Questions"}
              </span>

              {questions.length > 0 && (
                <div className="relative flex items-center">
                  <select
                    value={currentQuestionIndex}
                    onChange={(e) => setCurrentQuestionIndex(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {questions.map((q, idx) => (
                      <option key={idx} value={idx}>
                        Jump to Question {idx + 1} {idx === currentQuestionIndex ? "✓" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: Next Button & Add Question */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer"
                title="Add a new question"
              >
                <Plus size={13} /> Add
              </button>

              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex >= questions.length - 1 || questions.length === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* SINGLE ACTIVE QUESTION EDITOR */}
          {activeQuestion ? (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-md">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                    Question #{currentQuestionIndex + 1}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">ID: {activeQuestion.id}</span>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveCurrentQuestion}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Delete this question"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Question Text *</label>
                <textarea
                  rows={3}
                  value={activeQuestion.question}
                  onChange={(e) => handleCurrentQuestionChange("question", e.target.value)}
                  placeholder="e.g. Which keyword is used to allocate memory dynamically in C?"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Control Grid: Type, Difficulty, Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Question Type</label>
                  <select
                    value={activeQuestion.questionType}
                    onChange={(e) => handleCurrentQuestionChange("questionType", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
                    <option value="MCQ_MULTI">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill in Blanks</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="LONG_ANSWER">Long Answer</option>
                    <option value="ARRANGE_TOKENS">Arrange Tokens</option>
                    <option value="MATCH_PAIRS">Match Pairs</option>
                    <option value="SELF_ASSESSMENT">Self Assessment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Difficulty</label>
                  <select
                    value={activeQuestion.difficulty}
                    onChange={(e) => handleCurrentQuestionChange("difficulty", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={activeQuestion.marks}
                    onChange={(e) => handleCurrentQuestionChange("marks", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Options & Correct Answer Editor */}
              {(activeQuestion.questionType === "MCQ_SINGLE" || activeQuestion.questionType === "MCQ_MULTI") && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Options (Select correct {activeQuestion.questionType === "MCQ_MULTI" ? "answers" : "answer"})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activeQuestion.options || []).map((opt, optIdx) => {
                      const isChecked = activeQuestion.questionType === "MCQ_SINGLE"
                        ? String(activeQuestion.correctAnswer) === String(opt)
                        : Array.isArray(activeQuestion.correctAnswer) && activeQuestion.correctAnswer.includes(opt);

                      return (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type={activeQuestion.questionType === "MCQ_MULTI" ? "checkbox" : "radio"}
                            name={`correct-${currentQuestionIndex}`}
                            checked={isChecked}
                            onChange={() => handleToggleCorrectOption(opt)}
                            className="h-4 w-4 accent-emerald-500 shrink-0 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                          />
                          {(activeQuestion.options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="p-1 text-red-400 hover:text-red-300 shrink-0 cursor-pointer"
                              title="Remove Option"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* True/False Selection */}
              {activeQuestion.questionType === "TRUE_FALSE" && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-slate-300 block">Select Correct Answer</label>
                  <div className="flex items-center gap-4">
                    {["True", "False"].map((tfVal) => (
                      <label key={tfVal} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name={`tf-${currentQuestionIndex}`}
                          checked={String(activeQuestion.correctAnswer).toLowerCase() === tfVal.toLowerCase()}
                          onChange={() => handleCurrentQuestionChange("correctAnswer", tfVal)}
                          className="accent-emerald-500"
                        />
                        <span>{tfVal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-MCQ Correct Answer Input */}
              {activeQuestion.questionType !== "MCQ_SINGLE" &&
               activeQuestion.questionType !== "MCQ_MULTI" &&
               activeQuestion.questionType !== "TRUE_FALSE" && (
                <div className="space-y-1 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-slate-300">Correct Answer</label>
                  <input
                    type="text"
                    value={typeof activeQuestion.correctAnswer === "string" ? activeQuestion.correctAnswer : JSON.stringify(activeQuestion.correctAnswer || "")}
                    onChange={(e) => handleCurrentQuestionChange("correctAnswer", e.target.value)}
                    placeholder="Expected answer string..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Explanation Field */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-slate-400">Explanation / Feedback</label>
                <input
                  type="text"
                  value={activeQuestion.explanation}
                  onChange={(e) => handleCurrentQuestionChange("explanation", e.target.value)}
                  placeholder="Optional explanation shown to students after submission..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
              <p>No questions in this quiz yet.</p>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                <Plus size={14} /> Add First Question
              </button>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          {questions.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span className="text-xs font-mono font-bold text-slate-400">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex >= questions.length - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
