"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  CheckSquare,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Folder,
  X,
  Play
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import { useQuizzes } from "@/hooks/queries/instructor/useQuizzes";
import { useDeleteQuiz } from "@/hooks/queries/instructor/useDeleteQuiz";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";

export default function QuizzesPage() {
  const router = useRouter();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Create Quiz Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCourseId, setModalCourseId] = useState("");

  // Fetch all quizzes and courses
  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes,
    isError: isErrorQuizzes,
    refetch: refetchQuizzes
  } = useQuizzes();

  const {
    data: courses = [],
    isLoading: isLoadingCourses,
    isError: isErrorCourses,
  } = useInstructorCourses();

  const deleteQuizMutation = useDeleteQuiz();

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

  // Handle Delete Quiz
  const handleDelete = async (quizId, courseId) => {
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

  // Filter & Sort Logic
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

    // Filter by Course
    if (selectedCourse !== "all") {
      result = result.filter((quiz) => quiz.courseId === selectedCourse);
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
  }, [quizzes, searchQuery, selectedCourse, selectedStatus, sortBy]);

  // Reset pagination to page 1 on filter/search change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedStatus, sortBy]);

  // Paginated List
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

  // Modal Submit (Redirect to create page)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalCourseId) return;
    setIsModalOpen(false);
    router.push(`/instructor/quizzes/create/${modalCourseId}`);
  };

  const isLoading = isLoadingQuizzes || isLoadingCourses;
  const isError = isErrorQuizzes || isErrorCourses;

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Quizzes</h1>
          <p className="mt-2 text-slate-400">Create and manage quizzes for your courses.</p>
        </div>

        <button
          onClick={() => {
            if (courses.length > 0) {
              setModalCourseId(courses[0].id);
            }
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95"
        >
          <Plus size={16} />
          <span>Create Quiz</span>
        </button>
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
            <p className="text-[10px] text-slate-500 mt-1">Across all courses</p>
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
            <p className="text-[10px] text-slate-500 mt-1">By all students</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
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
          {/* Courses Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 text-sm cursor-pointer min-w-[150px]"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

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
                <th className="p-5">Course</th>
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
                  <td colSpan="7" className="p-12 text-center text-slate-500 italic text-sm">
                    No quizzes found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuizzes.map((quiz) => {
                  const isPub = quiz.isPublished || quiz.status === "Published" || quiz.status === "PUBLISHED";
                  return (
                    <tr
                      key={quiz.id}
                      className="border-b border-slate-800/50 hover:bg-slate-850/20 transition text-sm text-slate-300"
                    >
                      {/* Quiz Title & Description */}
                      <td className="p-5 pl-6 max-w-xs">
                        <p className="font-bold text-white leading-snug truncate">{quiz.title}</p>
                        <p className="text-xs text-slate-500 leading-normal truncate mt-0.5">
                          {quiz.description || "No description provided."}
                        </p>
                      </td>

                      {/* Course & Category */}
                      <td className="p-5 max-w-[180px]">
                        <p className="font-medium text-slate-200 leading-snug truncate">
                          {quiz.course?.title || "Standalone Quiz"}
                        </p>
                        {quiz.course?.category && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate uppercase font-semibold text-[10px]">
                            {quiz.course.category}
                          </p>
                        )}
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
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
                      <td className="p-5 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/instructor/questions/${quiz.id}`}>
                            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition">
                              <Edit size={14} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(quiz.id, quiz.courseId)}
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
              <span className="font-bold text-white">{totalItems}</span> quizzes
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Number Buttons */}
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

              {/* Next */}
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

      {/* Select Course Modal (For Create Quiz) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition p-1 hover:bg-slate-800/50 rounded-lg"
            >
              <X size={16} />
            </button>

            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Folder size={22} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Select Course</h3>
              <p className="text-xs text-slate-400">
                Choose a course under which the new quiz will be created.
              </p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Course List
                </label>
                <select
                  value={modalCourseId}
                  onChange={(e) => setModalCourseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none transition px-4 py-3 text-sm cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-extrabold px-5 py-3.5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalCourseId}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-extrabold px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}