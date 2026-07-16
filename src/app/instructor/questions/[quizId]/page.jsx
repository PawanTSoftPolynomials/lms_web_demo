"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Star,
  Layers,
  HelpCircle,
  ArrowLeft
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import { useQuestions } from "@/hooks/queries/instructor/useQuestions";
import { useDeleteQuestion } from "@/hooks/queries/instructor/useDeleteQuestion";
import { useQuiz } from "@/hooks/queries/instructor/useQuiz";

export default function QuestionListPage() {
  const params = useParams();
  const quizId = params.quizId;
  const router = useRouter();

  // Search, Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: quizData } = useQuiz(quizId, { enabled: !!quizId });
  const courseId = params.courseId || quizData?.courseId;

  const {
    data: questions = [],
    isLoading,
    isError,
    refetch: refetchQuestions
  } = useQuestions(quizId);

  const deleteQuestionMutation = useDeleteQuestion();

  const handleDelete = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await deleteQuestionMutation.mutateAsync({
        questionId,
        quizId,
      });
      refetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  // Filter Logic
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          (item.concept && item.concept.toLowerCase().includes(q))
      );
    }

    if (selectedType !== "all") {
      result = result.filter((item) => item.type === selectedType);
    }

    return result;
  }, [questions, searchQuery, selectedType]);

  // Reset page to 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Pagination bounds
  const totalItems = filteredQuestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, startIndex]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Failed to Load Questions</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button and Header */}
      <div className="space-y-4">
        <Link
          href={`/instructor/courses/${courseId}/quizzes`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Back to Quizzes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Quiz Questions
            </h1>
            <p className="mt-2 text-slate-400">
              Manage questions for quiz: <span className="text-orange-400 font-bold">{quizData?.title || "Quiz"}</span>
            </p>
          </div>

          <Link href={`/instructor/courses/${courseId}/quizzes/${quizId}/questions/create`}>
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95">
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 pl-12 text-sm"
          />
        </div>

        {/* Type Select Dropdown */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 text-sm cursor-pointer min-w-[170px]"
        >
          <option value="all">All Question Types</option>
          <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
          <option value="MCQ_MULTI">Multiple Choice</option>
          <option value="ARRANGE_TOKENS">Arrange Tokens</option>
          <option value="MATCH_PAIRS">Match Pairs</option>
          <option value="SELF_ASSESSMENT">Self Assessment</option>
        </select>
      </div>

      {/* Questions Data Table */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-5 pl-6">Question</th>
                <th className="p-5">Type</th>
                <th className="p-5 text-center">Marks</th>
                <th className="p-5">Options Details</th>
                <th className="p-5 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 italic text-sm">
                    No questions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q) => {
                  const type = q.type || "MCQ_SINGLE";
                  return (
                    <tr
                      key={q.id}
                      className="border-b border-slate-800/50 hover:bg-slate-850/20 transition text-sm text-slate-300"
                    >
                      {/* Question Text */}
                      <td className="p-5 pl-6 max-w-sm">
                        <p className="font-bold text-white leading-relaxed line-clamp-2">{q.question}</p>
                        {q.concept && (
                          <span className="inline-block text-[9px] text-purple-400 font-extrabold uppercase mt-1">
                            {q.concept}
                          </span>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="p-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                            type === "MCQ_SINGLE"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : type === "MCQ_MULTI"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : type === "ARRANGE_TOKENS"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              : type === "MATCH_PAIRS"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-200 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                          <Star size={11} className="text-orange-400 fill-orange-400/20" />
                          <span>{q.marks}</span>
                        </span>
                      </td>

                      {/* Options Details */}
                      <td className="p-5">
                        <span className="text-xs text-slate-400">
                          {type === "MATCH_PAIRS"
                            ? `${q.options?.left?.length ?? 0} Pairs`
                            : type === "ARRANGE_TOKENS"
                            ? `${q.options?.length ?? 0} Tokens`
                            : type === "SELF_ASSESSMENT"
                            ? "Essay Rubric"
                            : Array.isArray(q.options)
                            ? `${q.options.length} Options`
                            : "No options"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* View */}
                          <Link href={`/instructor/courses/${courseId}/quizzes/${quizId}/questions/view/${q.id}`}>
                            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-855 text-slate-400 hover:text-white transition">
                              <Eye size={14} />
                            </button>
                          </Link>
                          {/* Edit */}
                          <Link href={`/instructor/courses/${courseId}/quizzes/${quizId}/questions/edit/${q.id}`}>
                            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-855 text-slate-400 hover:text-white transition">
                              <Edit size={14} />
                            </button>
                          </Link>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="border-t border-slate-800 bg-slate-900/20 p-5 pl-6 pr-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-white">{endIndex}</span> of{" "}
              <span className="font-bold text-white">{totalItems}</span> questions
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 text-xs rounded-lg font-bold border transition ${
                      isActive
                        ? "bg-orange-500 border-orange-500 text-slate-950 shadow-md shadow-orange-500/15"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}