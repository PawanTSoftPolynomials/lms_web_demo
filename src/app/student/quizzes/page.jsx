"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Clock,
  Target,
  PlayCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  PlusCircle,
  BarChart2,
  Sparkles,
  ArrowRight
} from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import QuizFilters from "@/components/student/quizzes/QuizFilters";
import QuizTable from "@/components/student/quizzes/QuizTable";

import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import { generateSelfAssessmentQuiz } from "@/services/quiz.service";

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Generator form states
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // React Query Hooks
  const { data: enrollments = [], isLoading: coursesLoading } = useMyCourses();
  const { data: quizzes = [], isLoading: quizzesLoading, isError, refetch } = useQuizzes(
    selectedCourse !== "all" ? selectedCourse : undefined
  );

  const coursesList = useMemo(() => {
    return enrollments.map((e) => e.course).filter(Boolean);
  }, [enrollments]);

  // 1. Filter by selected course
  const filteredByCourse = useMemo(() => {
    if (selectedCourse === "all") return quizzes;
    return quizzes.filter((q) => q.courseId === selectedCourse);
  }, [quizzes, selectedCourse]);

  // 2. Filter by Category tab
  const filteredByCategory = useMemo(() => {
    switch (activeTab) {
      case "new":
        return filteredByCourse.filter((q) => !q.quizSubmissions?.[0]);
      case "completed":
        return filteredByCourse.filter((q) => !!q.quizSubmissions?.[0]);
      case "self_generate":
      case "reports":
      default:
        return filteredByCourse;
    }
  }, [filteredByCourse, activeTab]);

  // 3. Search and Sort list of quizzes
  const displayList = useMemo(() => {
    let result = [...filteredByCategory];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title?.toLowerCase().includes(keyword) ||
          quiz.description?.toLowerCase().includes(keyword)
      );
    }

    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "questions":
        result.sort(
          (a, b) => (b._count?.questions ?? 0) - (a._count?.questions ?? 0)
        );
        break;
      case "passingScore":
        result.sort((a, b) => b.passingScore - a.passingScore);
        break;
      case "timeLimit":
        result.sort((a, b) => b.timeLimit - a.timeLimit);
        break;
      case "latest":
      default:
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    return result;
  }, [filteredByCategory, search, sortBy]);

  // Dynamic KPI Stats calculations based on selected course
  const stats = useMemo(() => {
    const list = filteredByCourse;
    const totalQuestions = list.reduce(
      (sum, q) => sum + (q._count?.questions ?? 0),
      0
    );
    const avgPassScore = list.length
      ? Math.round(
          list.reduce((sum, q) => sum + q.passingScore, 0) / list.length
        )
      : 0;
    const avgTimeLimit = list.length
      ? Math.round(list.reduce((sum, q) => sum + q.timeLimit, 0) / list.length)
      : 0;

    return {
      total: list.length,
      questions: totalQuestions,
      avgPassing: avgPassScore,
      avgTime: avgTimeLimit
    };
  }, [filteredByCourse]);

  // Reports data calculations
  const reportStats = useMemo(() => {
    const completed = filteredByCourse.filter((q) => !!q.quizSubmissions?.[0]);
    const passed = completed.filter((q) => q.quizSubmissions[0].passed);
    const failedCount = completed.length - passed.length;
    const avgScore = completed.length
      ? Math.round(
          completed.reduce(
            (sum, q) => sum + (q.quizSubmissions[0].percentage ?? 0),
            0
          ) / completed.length
        )
      : 0;

    return {
      completedCount: completed.length,
      passedCount: passed.length,
      failedCount,
      avgScore
    };
  }, [filteredByCourse]);

  // Handler to self-generate a quiz
  const handleSelfGenerate = async () => {
    if (selectedCourse === "all") {
      setGenerationError("Please select a specific course first to generate a practice quiz.");
      return;
    }
    setGenerationError("");
    setIsGenerating(true);

    try {
      const quiz = await generateSelfAssessmentQuiz(selectedCourse, numQuestions);
      // Success! Refetch to reload data, and navigate student directly to the attempt screen
      await refetch();
      router.push(`/student/attempt/${quiz.id}`);
    } catch (err) {
      console.error(err);
      setGenerationError(err.response?.data?.message || "No questions found in this course to generate a practice quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (coursesLoading || quizzesLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center border border-slate-800 bg-slate-900/60">
        <h2 className="text-xl font-bold text-white">Unable to load quizzes</h2>
        <p className="mt-2 text-slate-400">Please try again later.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      <PageHeader
        title="Quizzes"
        subtitle="Test your knowledge by attempting quizzes assigned to your courses."
      />

      {/* 1. Dynamic Stats Cards Header */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Total Quizzes</p>
            <h3 className="text-2xl font-black text-white mt-1 leading-none">{stats.total}</h3>
          </div>
          <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 border border-orange-500/20">
            <BookOpen size={16} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Total Questions</p>
            <h3 className="text-2xl font-black text-white mt-1 leading-none">{stats.questions}</h3>
          </div>
          <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
            <HelpCircle size={16} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Avg Passing Score</p>
            <h3 className="text-2xl font-black text-white mt-1 leading-none">{stats.avgPassing}%</h3>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
            <Target size={16} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Avg Time Limit</p>
            <h3 className="text-2xl font-black text-white mt-1 leading-none">{stats.avgTime} min</h3>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
            <Clock size={16} />
          </div>
        </div>
      </div>

      {/* 2. Course Selection & Category Tab Strip */}
      <div className="space-y-4">
        {/* Course Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Filter by Course</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-orange-500 transition w-full sm:w-64 cursor-pointer"
            >
              <option value="all">All Enrolled Courses</option>
              {coursesList.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
            {[
              { id: "new", label: "New Quizzes", count: filteredByCourse.filter(q => !q.quizSubmissions?.[0]).length },
              { id: "completed", label: "Completed Quizzes", count: filteredByCourse.filter(q => !!q.quizSubmissions?.[0]).length },
              { id: "self_generate", label: "Self Generate Quiz", count: null },
              { id: "reports", label: "Report", count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearch("");
                  setGenerationError("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    activeTab === tab.id ? "bg-slate-950 text-orange-400" : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Render Tab Content */}
      {activeTab === "reports" ? (
        /* REPORTS SUB-PANEL */
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Quizzes Passed</p>
              <h4 className="text-xl font-black text-emerald-400 mt-1 leading-none">{reportStats.passedCount}</h4>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Quizzes Failed</p>
              <h4 className="text-xl font-black text-rose-500 mt-1 leading-none">{reportStats.failedCount}</h4>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Average Performance</p>
              <h4 className="text-xl font-black text-purple-400 mt-1 leading-none">{reportStats.avgScore}%</h4>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-350 mb-4 pl-1">
              Quiz Attempt Reports
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pl-3">Quiz</th>
                    <th className="pb-3 text-center w-36">Attempt Date</th>
                    <th className="pb-3 text-center w-28">Score</th>
                    <th className="pb-3 w-32">Result Status</th>
                    <th className="pb-3 text-right pr-3 w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40">
                  {filteredByCourse.filter(q => !!q.quizSubmissions?.[0]).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        No quiz attempts found. Start attempting quizzes to view performance reports.
                      </td>
                    </tr>
                  ) : (
                    filteredByCourse
                      .filter(q => !!q.quizSubmissions?.[0])
                      .map((quiz) => {
                        const submission = quiz.quizSubmissions[0];
                        return (
                          <tr key={quiz.id} className="hover:bg-slate-800/10 transition duration-200 align-middle border-b border-slate-800/40">
                            <td className="py-3.5 pl-3">
                              <span className="font-extrabold text-white">{quiz.title}</span>
                              <span className="text-[9px] text-slate-505 block uppercase font-semibold mt-0.5">
                                {quiz.course?.title ?? "Course Quiz"}
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-400 text-xs">
                              {new Date(submission.createdAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
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
                                <button className="px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 rounded-xl transition">
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
      ) : activeTab === "self_generate" ? (
        /* SELF GENERATE QUIZ COMPONENT */
        <div className="max-w-xl mx-auto py-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 border border-orange-500/20 shrink-0">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Self-Generate Practice Quiz</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dynamically generate a quiz from the course's question bank.</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-4">
              {/* Selected Course Context */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Selected Target Course</label>
                <div className="rounded-xl bg-slate-950 border border-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-350">
                  {selectedCourse === "all" ? (
                    <span className="text-amber-400 font-bold">⚠️ Please select a course from the filter above first</span>
                  ) : (
                    coursesList.find((c) => c.id === selectedCourse)?.title ?? "Target Course"
                  )}
                </div>
              </div>

              {/* Number of Questions Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Number of Questions</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                  disabled={selectedCourse === "all" || isGenerating}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-orange-500 transition w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={5}>5 Questions (Short Review)</option>
                  <option value={10}>10 Questions (Standard Quiz)</option>
                  <option value={15}>15 Questions (Full Test)</option>
                  <option value={20}>20 Questions (Grand Challenge)</option>
                </select>
              </div>

              {/* Error log if any */}
              {generationError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 font-semibold uppercase tracking-wide">
                  {generationError}
                </div>
              )}

              {/* Submit trigger button */}
              <button
                type="button"
                onClick={handleSelfGenerate}
                disabled={selectedCourse === "all" || isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-655 text-slate-950 font-black uppercase text-xs tracking-widest shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    Generate Quiz & Start
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD LIST VIEW (New, Completed) */
        <div className="space-y-6">
          <QuizFilters
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <QuizTable
            quizzes={displayList}
          />
        </div>
      )}
    </div>
  );
}