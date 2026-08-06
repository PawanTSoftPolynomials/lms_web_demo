"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { createRepositoryQuestion } from "@/services/questionRepository.service";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";

export default function CreateQuestionPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("MCQ_SINGLE");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [tags, setTags] = useState("");
  const [explanation, setExplanation] = useState("");

  const { data: courses = [] } = useInstructorCourses();
  const { data: modules = [] } = useModules(courseId);

  const handleCourseChange = (value) => {
    setCourseId(value);
    setModuleId("");
  };

  // Options for MCQ
  const [options, setOptions] = useState([
    { id: "opt-1", optionText: "", isCorrect: true },
    { id: "opt-2", optionText: "", isCorrect: false },
    { id: "opt-3", optionText: "", isCorrect: false },
    { id: "opt-4", optionText: "", isCorrect: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, optionText: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) {
      alert("Multiple choice questions require at least 2 options.");
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOptionTextChange = (idx, text) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], optionText: text };
      return updated;
    });
  };

  const handleToggleCorrect = (idx) => {
    setOptions((prev) => {
      const updated = [...prev];
      if (questionType === "MCQ_SINGLE") {
        // Single choice: only one correct
        return updated.map((opt, i) => ({
          ...opt,
          isCorrect: i === idx,
        }));
      } else {
        // Multi select: toggle boolean
        updated[idx] = { ...updated[idx], isCorrect: !updated[idx].isCorrect };
        return updated;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    if (!question.trim()) {
      setError("Question text is required.");
      return;
    }

    if (marks <= 0) {
      setError("Marks must be greater than zero.");
      return;
    }

    let finalOptions = options;
    let correctAnswerVal = null;

    if (questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTI") {
      const emptyOpt = options.find((o) => !o.optionText.trim());
      if (emptyOpt) {
        setError("Please fill out all option texts or remove empty options.");
        return;
      }

      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setError("Please select at least one correct answer.");
        return;
      }

      correctAnswerVal = options.filter((o) => o.isCorrect).map((o) => o.optionText.trim());
    } else if (questionType === "TRUE_FALSE") {
      finalOptions = [
        { id: "opt-1", optionText: "True", isCorrect: true },
        { id: "opt-2", optionText: "False", isCorrect: false },
      ];
      correctAnswerVal = "True";
    }

    setLoading(true);
    setError("");

    try {
      await createRepositoryQuestion({
        question: question.trim(),
        questionType,
        courseId,
        moduleId: moduleId || null,
        difficulty,
        marks: parseInt(marks, 10),
        negativeMarks: parseFloat(negativeMarks) || 0,
        tags: tags.trim(),
        explanation: explanation.trim(),
        options: finalOptions,
        correctAnswer: correctAnswerVal,
      });

      router.push("/instructor/questions");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create question.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/questions"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Create Question
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Add a new question manually to your centralized Question Repository.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Question Metadata & Content Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-slate-200">Question Content</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="" disabled>Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Module (Optional)
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  disabled={!courseId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Whole course (no specific module)</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question Text *
              </label>
              <textarea
                rows={4}
                placeholder="Type your full question statement here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Question Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
                  <option value="MCQ_MULTI">Multiple Select</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="LONG_ANSWER">Long Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Marks *
                </label>
                <input
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Negative Marks
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="syntax, basics"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Options Card for MCQ */}
          {(questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTI") && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-200">Answer Options</h3>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(idx)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        opt.isCorrect
                          ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
                          : "border-slate-700 bg-slate-900 text-transparent"
                      }`}
                      title={opt.isCorrect ? "Correct Option" : "Mark as Correct"}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.optionText}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs text-slate-100 focus:outline-none"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-200">Explanation & Notes (Optional)</h3>
            <textarea
              rows={3}
              placeholder="Provide solution explanation or reference notes for students..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              href="/instructor/questions"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? "Saving Question..." : "Save Question to Repository"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
