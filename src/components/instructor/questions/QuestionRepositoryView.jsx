"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  UploadCloud,
  Copy,
  Trash2,
  Archive,
  Edit3,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Tag,
  Check,
  ClipboardList,
  FileEdit,
  FileCheck2,
} from "lucide-react";
import {
  getRepositoryQuestions,
  deleteRepositoryQuestion,
  archiveRepositoryQuestion,
  duplicateRepositoryQuestion,
} from "@/services/questionRepository.service";

/**
 * The Question Repository list/search/CRUD view — rendered by both the
 * global /instructor/questions page and the Work module's Question
 * Repository page, so this logic exists in exactly one place.
 */
export default function QuestionRepositoryView({ showImportShortcuts = false }) {
  // State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  // Selection & Preview
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRepositoryQuestions({
        search,
        subject,
        topic,
        difficulty,
        questionType,
        status,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success) {
        setQuestions(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching repository questions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, subject, topic, difficulty, questionType, status, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleResetFilters = () => {
    setSearch("");
    setSubject("");
    setTopic("");
    setDifficulty("");
    setQuestionType("");
    setStatus("ACTIVE");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Actions
  const handleDuplicate = async (id) => {
    try {
      await duplicateRepositoryQuestion(id);
      setFeedbackMessage("Question duplicated successfully!");
      fetchQuestions();
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      alert("Failed to duplicate question: " + (err?.message || "Server error"));
    }
  };

  const handleArchive = async (id) => {
    if (!confirm("Are you sure you want to archive this question?")) return;
    try {
      await archiveRepositoryQuestion(id);
      setFeedbackMessage("Question archived.");
      fetchQuestions();
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      alert("Failed to archive question: " + (err?.message || "Server error"));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question? If used in quizzes, it will be archived.")) return;
    try {
      await deleteRepositoryQuestion(id);
      setFeedbackMessage("Question deleted / archived successfully.");
      fetchQuestions();
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      alert("Failed to delete question: " + (err?.message || "Server error"));
    }
  };

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Archive ${selectedIds.length} selected questions?`)) return;
    for (const id of selectedIds) {
      try {
        await archiveRepositoryQuestion(id);
      } catch (e) {}
    }
    setSelectedIds([]);
    setFeedbackMessage("Selected questions archived.");
    fetchQuestions();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete/Archive ${selectedIds.length} selected questions?`)) return;
    for (const id of selectedIds) {
      try {
        await deleteRepositoryQuestion(id);
      } catch (e) {}
    }
    setSelectedIds([]);
    setFeedbackMessage("Selected questions processed.");
    fetchQuestions();
  };

  // Badges styling helper
  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "MCQ_MULTI":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "TRUE_FALSE":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "SHORT_ANSWER":
      case "LONG_ANSWER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    }
  };

  return (
    <div className="text-slate-100 font-sans">
      {/* Header Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Question Repository
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Centralized question bank. Upload, organize, and manage reusable questions across all quizzes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/instructor/questions/upload"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 text-sm font-semibold hover:bg-slate-800 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Upload Questions</span>
            </Link>

            <Link
              href="/instructor/questions/create"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-sm font-bold shadow-lg shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Question</span>
            </Link>
          </div>
        </div>

        {showImportShortcuts && (
          <div className="grid gap-3 sm:grid-cols-3 mt-5">
            <Link
              href="/instructor/work/quiz"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 text-xs font-bold text-slate-300 transition"
            >
              <ClipboardList size={14} className="text-orange-450" /> Import into Quiz
            </Link>
            <Link
              href="/instructor/work/assessment"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 text-xs font-bold text-slate-300 transition"
            >
              <FileEdit size={14} className="text-orange-450" /> Import into Assessment
            </Link>
            <Link
              href="/instructor/work/test"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 text-xs font-bold text-slate-300 transition"
            >
              <FileCheck2 size={14} className="text-orange-450" /> Import into Test
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search questions, topics, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              <option value="Python">Python</option>
              <option value="Web Development">Web Development</option>
              <option value="Database">Database</option>
              <option value="Java">Java</option>
              <option value="General">General</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Question Type Filter */}
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
              <option value="MCQ_MULTI">Multiple Select</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="LONG_ANSWER">Long Answer</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ACTIVE">Active Only</option>
              <option value="ARCHIVED">Archived Only</option>
              <option value="">All Statuses</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{pagination.total}</span> questions in repository
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {selectedIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{selectedIds.length} Questions Selected</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 transition"
              >
                Archive Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 transition"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-slate-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Questions Table / List */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Loading Question Repository...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-200">No Questions Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search filters or upload new questions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {/* Header row */}
              <div className="px-6 py-3.5 bg-slate-900/90 text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === questions.length && questions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Question Details</span>
                </div>
                <div className="flex items-center space-x-8 pr-4">
                  <span className="w-20 text-center">Marks</span>
                  <span className="w-24 text-center">Usage</span>
                  <span className="w-24 text-right">Actions</span>
                </div>
              </div>

              {/* Items */}
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-900/40 transition group"
                >
                  <div className="flex items-start space-x-4 max-w-3xl">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelectId(q.id)}
                      className="mt-1 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${getTypeBadge(q.questionType)}`}>
                          {q.questionType}
                        </span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {q.subject || "General"} • {q.topic || "General"}
                        </span>
                        {q.status === "ARCHIVED" && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                            ARCHIVED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition">
                        {q.title || q.question.slice(0, 60)}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1">{q.question}</p>

                      {q.tags && (
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                          <Tag className="w-3 h-3 text-slate-600" />
                          <span>{q.tags}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Meta & Actions */}
                  <div className="flex items-center space-x-8 pr-2 shrink-0">
                    <div className="w-20 text-center">
                      <span className="text-xs font-mono font-bold text-amber-400">{q.marks} pts</span>
                    </div>

                    <div className="w-24 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs font-mono text-slate-300">
                        {q.usedInQuizzesCount} Quizzes
                      </span>
                    </div>

                    <div className="w-24 flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        title="View Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleArchive(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-sky-400"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setPreviewQuestion(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase ${getTypeBadge(previewQuestion.questionType)}`}>
                {previewQuestion.questionType}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase ${getDifficultyBadge(previewQuestion.difficulty)}`}>
                {previewQuestion.difficulty}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {previewQuestion.subject} • {previewQuestion.topic}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">{previewQuestion.title}</h3>
              <p className="text-sm text-slate-300 mt-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 whitespace-pre-line">
                {previewQuestion.question}
              </p>
            </div>

            {/* Options */}
            {Array.isArray(previewQuestion.options) && previewQuestion.options.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Options</h4>
                <div className="space-y-2">
                  {previewQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        opt.isCorrect
                          ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                          : "bg-slate-950/40 border-slate-800 text-slate-300"
                      }`}
                    >
                      <span>{opt.optionText || String(opt)}</span>
                      {opt.isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewQuestion.explanation && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span className="font-bold">Explanation: </span>
                {previewQuestion.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
