"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HelpCircle,
  BarChart2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  CalendarCheck,
  Activity
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

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

  // 3. Display list of quizzes
  const displayList = useMemo(() => {
    const result = [...filteredByCategory];
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [filteredByCategory]);

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
    <div className="space-y-6 pb-16 animate-fade-in duration-300 max-w-full overflow-x-hidden">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">Quizzes</h1>
          <p className="text-xs text-slate-400 mt-1.5">View and manage quizzes for your enrolled courses.</p>
        </div>
        {viewingCourseId && (
          <button
            type="button"
            onClick={() => {
              setViewingCourseId(null);
              setSelectedCourse("all");
              router.replace("/student/quizzes");
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition min-h-[44px] shrink-0"
          >
            <ArrowLeft size={16} className="text-orange-500" />
            <span>Back to Courses</span>
          </button>
        )}
      </div>

      {/* 2. Main content view toggle */}
      {!viewingCourseId ? (
        /* COURSE GRID OVERVIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coursesList.map((course) => {
              const actionItems = [
                {
                  label: "My Learning",
                  icon: CalendarCheck,
                  iconColor: "text-blue-400",
                  onClick: () => router.push(`/student/learn/${course.id}`)
                },
                {
                  label: "My Homework",
                  icon: CalendarCheck,
                  iconColor: "text-orange-400",
                  onClick: () => router.push(`/student/assignments`)
                },
                {
                  label: "My Assignment",
                  icon: CalendarCheck,
                  iconColor: "text-purple-400",
                  onClick: () => router.push(`/student/assignments`)
                },
                {
                  label: "My Test",
                  icon: CalendarCheck,
                  iconColor: "text-emerald-400",
                  onClick: () => {
                    setViewingCourseId(course.id);
                    setActiveTab("new");
                  }
                },
                {
                  label: "My Assessment Activity",
                  icon: CalendarCheck,
                  iconColor: "text-pink-400",
                  onClick: () => {
                    setViewingCourseId(course.id);
                    setActiveTab("self_generate");
                  }
                },
                {
                  label: "Feedback",
                  icon: CalendarCheck,
                  iconColor: "text-rose-400",
                  onClick: () => router.push(`/student/feedback`)
                },
                {
                  label: "CO Outcome Summary",
                  icon: BarChart2,
                  iconColor: "text-amber-400",
                  onClick: () => router.push(`/student/progress`)
                },
                {
                  label: "Check Activity Status",
                  icon: Activity,
                  iconColor: "text-cyan-400",
                  onClick: () => router.push(`/student/achievements`)
                }
              ];

              return (
                <div
                  key={course.id}
                  className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 sm:p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-slate-700 select-none max-w-sm w-full mx-auto sm:max-w-none"
                >
                  {/* Card Header */}
                  <div className="pb-3 text-center border-b border-slate-800/50">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                      {course.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                      Theory, Practical
                    </span>
                  </div>

                  {/* List of Navigation Actions */}
                  <div className="space-y-1 my-3">
                    {actionItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={item.onClick}
                          className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-200 hover:text-white transition group py-2 px-2.5 sm:px-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 min-h-[44px] cursor-pointer"
                        >
                          <Icon size={16} className={`${item.iconColor} shrink-0 stroke-[2]`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Right Help Icon */}
                  <div className="flex justify-end pt-1 text-slate-500 hover:text-white transition select-none">
                    <HelpCircle size={16} />
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
        /* COURSE DETAIL VIEW (CLEAN DIRECT QUIZ CONTENT VIEW) */
        <div className="space-y-5">
          {/* Header summary for selected course */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                {coursesList.find((c) => c.id === viewingCourseId)?.title}
              </h3>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">
                {activeTab === "new"
                  ? "New Quizzes"
                  : activeTab === "completed"
                  ? "Completed Quizzes"
                  : activeTab === "self_generate"
                  ? "Self-Generate Practice"
                  : "Quiz Reports"}
              </span>
            </div>
          </div>

          {/* Content render block */}
          {activeTab === "reports" ? (
            <div className="space-y-5">
              {/* Report Metrics */}
              <div className="grid gap-3 grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Passed</p>
                  <h4 className="text-base sm:text-lg font-black text-emerald-400 mt-1">{reportStats.passedCount}</h4>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Failed</p>
                  <h4 className="text-base sm:text-lg font-black text-rose-400 mt-1">{reportStats.failedCount}</h4>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Avg Score</p>
                  <h4 className="text-base sm:text-lg font-black text-purple-400 mt-1">{reportStats.avgScore}%</h4>
                </div>
              </div>

              {/* Reports List */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Quiz Attempt Reports
                </h3>

                {/* MOBILE CARDS (< md) FOR REPORTS */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filteredByCourse.filter(q => !!q.quizSubmissions?.[0]).length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                      No quiz attempts found.
                    </div>
                  ) : (
                    filteredByCourse
                      .filter(q => !!q.quizSubmissions?.[0])
                      .map((quiz) => {
                        const submission = quiz.quizSubmissions[0];
                        return (
                          <div key={quiz.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-xs font-extrabold text-white">{quiz.title}</h4>
                              <span className={`inline-flex rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                submission.passed
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}>
                                {submission.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/50 font-mono">
                              <span>Date: {new Date(submission.createdAt).toLocaleDateString()}</span>
                              <span className="font-extrabold text-white">Score: {submission.score}/{quiz._count?.questions ?? 10} ({submission.percentage}%)</span>
                            </div>
                            <Link href={`/student/result/${quiz.id}`} className="block pt-1">
                              <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-extrabold min-h-[44px]">
                                View Result
                              </button>
                            </Link>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* DESKTOP TABLE (>= md) FOR REPORTS */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pl-3">Quiz</th>
                        <th className="pb-3 text-center w-36">Attempt Date</th>
                        <th className="pb-3 text-center w-28">Score</th>
                        <th className="pb-3 w-32">Status</th>
                        <th className="pb-3 text-right pr-3 w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
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
                              <tr key={quiz.id} className="hover:bg-slate-800/20 transition border-b border-slate-800/40">
                                <td className="py-3.5 pl-3">
                                  <span className="font-extrabold text-white">{quiz.title}</span>
                                </td>
                                <td className="py-3.5 text-center font-bold text-slate-400 text-xs">
                                  {new Date(submission.createdAt).toLocaleDateString()}
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
                                    <button className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 border border-slate-700/60 rounded-xl transition cursor-pointer min-h-[44px]">
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
            <div className="max-w-xl mx-auto py-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 border border-orange-500/20 shrink-0">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Self-Generate Practice Quiz</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Dynamically generate a practice quiz from course questions.</p>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Course</label>
                    <div className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-200 min-h-[44px] flex items-center">
                      {coursesList.find((c) => c.id === selectedCourse)?.title ?? "Target Course"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Number of Questions</label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                      disabled={isGenerating}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-orange-500 transition w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase text-xs tracking-widest shadow-md shadow-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>Generating Quiz...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Quiz & Start</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
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