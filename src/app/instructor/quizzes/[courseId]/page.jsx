"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  CheckSquare,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Play,
  Star,
  Eye
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ImportQuestionsModal from "@/components/instructor/questions/ImportQuestionsModal";

import { useQuizzes } from "@/hooks/queries/instructor/useQuizzes";
import { useDeleteQuiz } from "@/hooks/queries/instructor/useDeleteQuiz";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useQuestions } from "@/hooks/queries/instructor/useQuestions";
import { useDeleteQuestion } from "@/hooks/queries/instructor/useDeleteQuestion";

export default function CourseQuizListPage() {
  const { courseId } = useParams();
  const router = useRouter();

  // Selected Quiz state for Master-Detail pattern
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showImport, setShowImport] = useState(false);

  // Quiz Search, Filters & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Quiz Questions Search, Filter & Pagination States
  const [qSearchQuery, setQSearchQuery] = useState("");
  const [qSelectedType, setQSelectedType] = useState("all");
  const [qCurrentPage, setQCurrentPage] = useState(1);
  const qItemsPerPage = 5;

  // Fetch quizzes for this specific course
  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes,
    isError: isErrorQuizzes,
    refetch: refetchQuizzes,
  } = useQuizzes(courseId);

  // Fetch course details for title/breadcrumbs
  const {
    data: course,
    isLoading: isLoadingCourse,
    isError: isErrorCourse,
  } = useInstructorCourse(courseId, { enabled: !!courseId });

  // Fetch questions specifically for the selected quiz
  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
    refetch: refetchQuestions,
  } = useQuestions(selectedQuiz?.id);

  const deleteQuizMutation = useDeleteQuiz();
  const deleteQuestionMutation = useDeleteQuestion();

  // Delete Quiz callback
  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      await deleteQuizMutation.mutateAsync({
        quizId,
        courseId,
      });
      refetchQuizzes();
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    }
  };

  // Delete Question callback
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await deleteQuestionMutation.mutateAsync({
        questionId,
        quizId: selectedQuiz.id,
      });
      refetchQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = quizzes.length;
    const published = quizzes.filter(
      (q) => q.isPublished || q.status === "Published" || q.status === "PUBLISHED"
    ).length;
    const drafts = total - published;
    const attempts = quizzes.reduce(
      (acc, q) => acc + (q._count?.quizSubmissions ?? 0),
      0
    );

    return { total, published, drafts, attempts };
  }, [quizzes]);

  // Quiz Filter & Sort Logic
  const filteredQuizzes = useMemo(() => {
    let result = [...quizzes];

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          (quiz.description && quiz.description.toLowerCase().includes(q))
      );
    }

    // Filter by Status
    if (selectedStatus !== "all") {
      result = result.filter((quiz) => {
        const isPub = quiz.isPublished || quiz.status === "Published" || quiz.status === "PUBLISHED";
        return selectedStatus === "published" ? isPub : !isPub;
      });
    }

    // Sort Logic
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [quizzes, searchQuery, selectedStatus, sortBy]);

  // Reset page pagination to page 1 on filter/search change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, sortBy]);

  // Quiz Pagination bounds
  const totalItems = filteredQuizzes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedQuizzes = useMemo(() => {
    return filteredQuizzes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuizzes, startIndex]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Questions Filter Logic
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (qSearchQuery.trim() !== "") {
      const q = qSearchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          (item.concept && item.concept.toLowerCase().includes(q))
      );
    }

    if (qSelectedType !== "all") {
      result = result.filter((item) => item.type === qSelectedType);
    }

    return result;
  }, [questions, qSearchQuery, qSelectedType]);

  // Reset questions page when filters change
  useMemo(() => {
    setQCurrentPage(1);
  }, [qSearchQuery, qSelectedType]);

  // Questions Pagination bounds
  const totalQItems = filteredQuestions.length;
  const totalQPages = Math.ceil(totalQItems / qItemsPerPage);
  const startQIndex = (qCurrentPage - 1) * qItemsPerPage;
  const endQIndex = Math.min(startQIndex + qItemsPerPage, totalQItems);
  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(startQIndex, startQIndex + qItemsPerPage);
  }, [filteredQuestions, startQIndex]);

  const handleQPageChange = (page) => {
    if (page >= 1 && page <= totalQPages) {
      setQCurrentPage(page);
    }
  };

  const isLoading = isLoadingQuizzes || isLoadingCourse;
  const isError = isErrorQuizzes || isErrorCourse;

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
          <h2 className="text-2xl font-semibold">Failed to Load Quizzes</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative min-h-[600px]">
      <AnimatePresence mode="wait">
        {!selectedQuiz ? (
          // ================= MASTER: COURSE QUIZ LIST VIEW =================
          <motion.div
            key="course-quiz-list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Back button and Header */}
            <div className="space-y-4">
              <Link
                href={`/instructor/courses/${courseId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={14} />
                Back to Course Details
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">Course Quizzes</h1>
                  <p className="mt-2 text-slate-400">
                    Manage quizzes for course: <span className="text-orange-400 font-bold">{course?.title || "Course"}</span>
                  </p>
                </div>

                <Link href={`/instructor/quizzes/create/${courseId}`}>
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95">
                    <Plus size={16} />
                    <span>Add Quiz</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Quizzes */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Quizzes</p>
                  <h3 className="text-3xl font-black text-white mt-1">{metrics.total}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">For this course</p>
                </div>
              </div>

              {/* Published */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Published</p>
                  <h3 className="text-3xl font-black text-white mt-1">{metrics.published}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Active quizzes</p>
                </div>
              </div>

              {/* Drafts */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <Edit size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Drafts</p>
                  <h3 className="text-3xl font-black text-white mt-1">{metrics.drafts}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Unpublished quizzes</p>
                </div>
              </div>

              {/* Total Attempts */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Play size={24} className="rotate-90" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Attempts</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {metrics.attempts.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">By enrolled students</p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 pl-12 text-sm"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 text-sm cursor-pointer min-w-[130px]"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 text-sm cursor-pointer min-w-[140px]"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="title">Sort by: Title</option>
                </select>
              </div>
            </div>

            {/* Quizzes Table */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-5 pl-6">Quiz Title</th>
                      <th className="p-5 text-center">Questions</th>
                      <th className="p-5 text-center">Attempts</th>
                      <th className="p-5">Status</th>
                      <th className="p-5">Created At</th>
                      <th className="p-5 pr-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuizzes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-slate-500 italic text-sm">
                          No quizzes found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedQuizzes.map((quiz) => {
                        const isPub = quiz.isPublished || quiz.status === "Published" || quiz.status === "PUBLISHED";
                        return (
                          <tr
                            key={quiz.id}
                            onClick={() => setSelectedQuiz(quiz)}
                            className="border-b border-slate-800/50 hover:bg-slate-850/40 transition-all duration-200 text-sm text-slate-300 cursor-pointer group"
                          >
                            {/* Quiz Title & Description */}
                            <td className="p-5 pl-6 max-w-xs">
                              <p className="font-bold text-white group-hover:text-orange-400 transition-colors leading-snug truncate">{quiz.title}</p>
                              <p className="text-xs text-slate-500 leading-normal truncate mt-0.5">
                                {quiz.description || "No description provided."}
                              </p>
                            </td>

                            {/* Questions Count */}
                            <td className="p-5 text-center font-bold text-slate-200">
                              {quiz._count?.questions ?? 0}
                            </td>

                            {/* Attempts Count */}
                            <td className="p-5 text-center font-bold text-slate-200">
                              {quiz._count?.quizSubmissions ?? 0}
                            </td>

                            {/* Status */}
                            <td className="p-5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${
                                  isPub
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                }`}
                              >
                                {isPub ? "Published" : "Draft"}
                              </span>
                            </td>

                            {/* Created At Date */}
                            <td className="p-5 text-slate-400 text-xs">
                              {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>

                            {/* Actions */}
                            <td className="p-5 pr-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/instructor/questions/create/${quiz.id}`}>
                                  <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-orange-400 hover:text-orange-300 transition" title="Add Question">
                                    <Plus size={14} />
                                  </button>
                                </Link>
                                
                                <Link href={`/instructor/courses/${courseId}/quizzes/edit/${quiz.id}`}>
                                  <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Edit Quiz Details">
                                    <Edit size={14} />
                                  </button>
                                </Link>

                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                                  title="Delete Quiz"
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
                    <span className="font-bold text-white">{totalItems}</span> quizzes
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
          </motion.div>
        ) : (
          // ================= DETAIL: SELECTED QUIZ QUESTIONS VIEW =================
          <motion.div
            key="course-questions-list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Header & Summary Row */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  refetchQuizzes();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={14} />
                Back to Quizzes
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-extrabold uppercase tracking-widest pl-0.5">
                    <span>QUIZZES</span>
                    <span>&gt;</span>
                    <span className="text-orange-400">{selectedQuiz.title}</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">Quiz Questions</h1>
                  <div className="flex flex-wrap gap-2.5 items-center mt-2">
                    <span className="text-slate-500 text-xs font-semibold">
                      Course: <span className="text-slate-300 font-bold">{course?.title || "Course"}</span>
                    </span>
                    <span className="text-slate-700 font-mono text-xs">•</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                      selectedQuiz.isPublished || selectedQuiz.status === "Published" || selectedQuiz.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {selectedQuiz.isPublished || selectedQuiz.status === "Published" || selectedQuiz.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                    <span className="text-slate-700 font-mono text-xs">•</span>
                    <span className="text-slate-500 text-xs font-semibold">
                      Questions: <span className="text-slate-300 font-bold">{questions.length}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowImport(true)}
                    className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-extrabold text-sm px-5 py-3.5 transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Import Questions</span>
                  </button>

                  <Link href={`/instructor/questions/create/${selectedQuiz.id}`}>
                    <button className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95 font-sans">
                      <Plus size={16} />
                      <span>Add Question</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Questions Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={qSearchQuery}
                  onChange={(e) => setQSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 pl-12 text-sm"
                />
              </div>

              {/* Filter */}
              <select
                value={qSelectedType}
                onChange={(e) => setQSelectedType(e.target.value)}
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

            {/* Questions Table */}
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
                    {isLoadingQuestions ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <Loader />
                        </td>
                      </tr>
                    ) : paginatedQuestions.length === 0 ? (
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
                            className="border-b border-slate-800/50 hover:bg-slate-855/20 transition text-sm text-slate-300"
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
                                <Link href={`/instructor/courses/${courseId}/quizzes/${selectedQuiz.id}/questions/view/${q.id}`}>
                                  <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition">
                                    <Eye size={14} />
                                  </button>
                                </Link>
                                {/* Edit */}
                                <Link href={`/instructor/courses/${courseId}/quizzes/${selectedQuiz.id}/questions/edit/${q.id}`}>
                                  <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition">
                                    <Edit size={14} />
                                  </button>
                                </Link>
                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
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

              {/* Questions Pagination Footer */}
              {totalQItems > 0 && (
                <div className="border-t border-slate-800 bg-slate-900/20 p-5 pl-6 pr-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-xs text-slate-400">
                    Showing <span className="font-bold text-white">{startQIndex + 1}</span> to{" "}
                    <span className="font-bold text-white">{endQIndex}</span> of{" "}
                    <span className="font-bold text-white">{totalQItems}</span> questions
                  </span>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={qCurrentPage === 1}
                      onClick={() => handleQPageChange(qCurrentPage - 1)}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalQPages }, (_, i) => i + 1).map((page) => {
                      const isActive = page === qCurrentPage;
                      return (
                        <button
                          key={page}
                          onClick={() => handleQPageChange(page)}
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
                      disabled={qCurrentPage === totalQPages}
                      onClick={() => handleQPageChange(qCurrentPage + 1)}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showImport && (
        <ImportQuestionsModal
          quizId={selectedQuiz?.id}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            refetchQuestions();
          }}
        />
      )}
    </div>
  );
}