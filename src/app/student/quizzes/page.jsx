"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  PenTool,
  Info,
  CalendarCheck,
  Activity
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

function StudentQuizzesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  
  // Track currently viewed course detail (null = show all courses grid)
  const [viewingCourseId, setViewingCourseId] = useState(null);

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

  const courseParam = searchParams.get("courseId");

  // Adjust activeTab and viewingCourseId state when query params change
  useEffect(() => {
    if (courseParam) {
      setViewingCourseId(courseParam);
      setSelectedCourse(courseParam);
    } else {
      setViewingCourseId(null);
      setSelectedCourse("all");
    }

    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [courseParam, tabParam]);

  // 1. Filter by selected course
  const filteredByCourse = useMemo(() => {
    if (selectedCourse === "all") return quizzes;
    return quizzes.filter((q) => q.courseId === selectedCourse);
  }, [quizzes, selectedCourse]);

  // 2. Filter by Category tab
  const filteredByCategory = useMemo(() => {
    switch (activeTab) {
      case "new":
        return filteredByCourse.filter((q) => q.title !== "Self-Generated Practice Quiz" && !q.quizSubmissions?.[0]);
      case "completed":
        return filteredByCourse.filter((q) => q.title !== "Self-Generated Practice Quiz" && !!q.quizSubmissions?.[0]);
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
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none">Quizzes</h1>
          <p className="text-xs text-slate-400 mt-2">View and manage quizzes for your courses.</p>
        </div>
        {viewingCourseId && (
          <button
            onClick={() => {
              setViewingCourseId(null);
              setSelectedCourse("all");
              router.replace("/student/quizzes");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-355 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-750 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Courses</span>
          </button>
        )}
      </div>

      {/* 2. Main content view toggle */}
      {!viewingCourseId ? (
        /* COURSE GRID OVERVIEW */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesList.map((course) => {
              const courseQuizzes = quizzes.filter(q => q.courseId === course.id);
              
              const newCount = courseQuizzes.filter(
                (q) => q.title !== "Self-Generated Practice Quiz" && !q.quizSubmissions?.[0]
              ).length;
              
              const completedCount = courseQuizzes.filter(
                (q) => q.title !== "Self-Generated Practice Quiz" && !!q.quizSubmissions?.[0]
              ).length;
              
              const practiceCount = courseQuizzes.filter(
                (q) => q.title === "Self-Generated Practice Quiz"
              ).length;

              const actionItems = [
                {
                  label: "My Learning",
                  icon: CalendarCheck,
                  color: "text-blue-500",
                  border: "border-blue-500/15",
                  bg: "bg-blue-500/5",
                  status: "Learn",
                  onClick: () => router.push(`/student/learn/${course.id}`)
                },
                {
                  label: "My Homework",
                  icon: CalendarCheck,
                  color: "text-orange-500",
                  border: "border-orange-500/15",
                  bg: "bg-orange-500/5",
                  status: "Homework",
                  onClick: () => router.push(`/student/assignments`)
                },
                {
                  label: "My Assignment",
                  icon: CalendarCheck,
                  color: "text-purple-500",
                  border: "border-purple-500/15",
                  bg: "bg-purple-500/5",
                  status: "Assignments",
                  onClick: () => router.push(`/student/assignments`)
                },
                {
                  label: "My Test",
                  icon: CalendarCheck,
                  color: "text-emerald-500",
                  border: "border-emerald-500/15",
                  bg: "bg-emerald-500/5",
                  status: `${newCount} Pending`,
                  onClick: () => {
                    setViewingCourseId(course.id);
                    setActiveTab("new");
                  }
                },
                {
                  label: "My Assessment Activity",
                  icon: CalendarCheck,
                  color: "text-pink-500",
                  border: "border-pink-500/15",
                  bg: "bg-pink-500/5",
                  status: `${courseQuizzes.length} Quizzes`,
                  onClick: () => {
                    setViewingCourseId(course.id);
                    setActiveTab("self_generate");
                  }
                },
                {
                  label: "Feedback",
                  icon: CalendarCheck,
                  color: "text-rose-500",
                  border: "border-rose-500/15",
                  bg: "bg-rose-500/5",
                  status: "Submit",
                  onClick: () => router.push(`/student/feedback`)
                },
                {
                  label: "CO Outcome Summary",
                  icon: BarChart2,
                  color: "text-amber-500",
                  border: "border-amber-500/15",
                  bg: "bg-amber-500/5",
                  status: "View",
                  onClick: () => router.push(`/student/progress`)
                },
                {
                  label: "Check Activity Status",
                  icon: Activity,
                  color: "text-cyan-500",
                  border: "border-cyan-500/15",
                  bg: "bg-cyan-500/5",
                  status: "Check",
                  onClick: () => router.push(`/student/achievements`)
                }
              ];

              return (
                <div
                  key={course.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm flex flex-col justify-between hover:border-orange-500/20 hover:-translate-y-0.5 transition duration-300"
                >
                  {/* Center-aligned Card Header (Matches user course card design) */}
                  <div className="text-center pb-5">
                    <h3 className="text-lg font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                      {course.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">
                      Theory, Practical
                    </span>
                  </div>

                  {/* List of Navigation Actions (Divided row structure matching user course card layout) */}
                  <div className="divide-y divide-slate-800/80 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-955/20">
                    {actionItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={item.onClick}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/50 transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${item.border} ${item.bg} ${item.color}`}>
                              <Icon size={18} className="stroke-[2]" />
                            </div>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-400 transition">
                              {item.status}
                            </span>
                            <ChevronRight size={13} className="text-slate-650 group-hover:text-orange-500 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Right Help Icon */}
                  <div className="flex justify-end pt-3 text-slate-500 hover:text-white transition select-none">
                    <HelpCircle size={15} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Info Banner */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4 flex gap-3 items-center text-xs text-slate-400">
            <Info size={16} className="text-orange-500 shrink-0" />
            <span className="font-medium">Quizzes help you test your knowledge and track your learning progress.</span>
          </div>
        </div>
      ) : (
        /* COURSE DETAIL VIEW */
        <div className="space-y-6">
          {/* Header summary for selected course */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                {coursesList.find((c) => c.id === viewingCourseId)?.title}
              </h3>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mt-1">
                Category: {coursesList.find((c) => c.id === viewingCourseId)?.category || "General"}
              </span>
            </div>

            {/* Quick Action Navigation Strip */}
            <div className="flex flex-wrap gap-1 bg-slate-955 p-1 rounded-xl border border-slate-850">
              {[
                { id: "new", label: "New Quizzes" },
                { id: "completed", label: "Completed" },
                { id: "self_generate", label: "Self Generate" },
                { id: "reports", label: "Reports" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearch("");
                    setGenerationError("");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-slate-955"
                      : "text-slate-450 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content render block */}
          {activeTab === "reports" ? (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Passed</p>
                  <h4 className="text-lg font-black text-emerald-400 mt-1">{reportStats.passedCount}</h4>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-555">Failed</p>
                  <h4 className="text-lg font-black text-rose-500 mt-1">{reportStats.failedCount}</h4>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-555">Avg Score</p>
                  <h4 className="text-lg font-black text-purple-400 mt-1">{reportStats.avgScore}%</h4>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4 pl-1">
                  Quiz Attempt Reports
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black text-slate-550 uppercase tracking-wider">
                        <th className="pb-3 pl-3">Quiz</th>
                        <th className="pb-3 text-center w-36">Attempt Date</th>
                        <th className="pb-3 text-center w-28">Score</th>
                        <th className="pb-3 w-32">Status</th>
                        <th className="pb-3 text-right pr-3 w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40">
                      {filteredByCourse.filter(q => !!q.quizSubmissions?.[0]).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No quiz attempts found.
                          </td>
                        </tr>
                      ) : (
                        filteredByCourse
                          .filter(q => !!q.quizSubmissions?.[0])
                          .map((quiz) => {
                            const submission = quiz.quizSubmissions[0];
                            return (
                              <tr key={quiz.id} className="hover:bg-slate-800/10 transition border-b border-slate-800/40">
                                <td className="py-3.5 pl-3">
                                  <span className="font-extrabold text-white">{quiz.title}</span>
                                </td>
                                <td className="py-3.5 text-center font-bold text-slate-400 text-xs">
                                  {new Date(submission.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3.5 text-center text-slate-355 font-extrabold text-xs">
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
                                    <button className="px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 rounded-xl transition cursor-pointer">
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
            <div className="max-w-xl mx-auto py-4">
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Selected Target Course</label>
                    <div className="rounded-xl bg-slate-955 border border-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-355">
                      {coursesList.find((c) => c.id === selectedCourse)?.title ?? "Target Course"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest block">Number of Questions</label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                      disabled={isGenerating}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-orange-500 transition w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={5}>5 Questions (Short Review)</option>
                      <option value={10}>10 Questions (Standard Quiz)</option>
                      <option value={15}>15 Questions (Full Test)</option>
                      <option value={20}>20 Questions (Grand Challenge)</option>
                    </select>
                  </div>

                  {generationError && (
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 font-semibold uppercase tracking-wide">
                      {generationError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSelfGenerate}
                    disabled={isGenerating}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-655 text-slate-950 font-black uppercase text-xs tracking-widest shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      )}
    </div>
  );
}

export default function StudentQuizzesPage() {
  return (
    <Suspense fallback={<Loader />}>
      <StudentQuizzesPageContent />
    </Suspense>
  );
}