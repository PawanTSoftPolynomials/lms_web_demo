"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import QuizTable from "@/components/student/quizzes/QuizTable";
import QuizCourseCard from "@/components/student/quizzes/QuizCourseCard";
import QuizReportsView from "@/components/student/quizzes/QuizReportsView";
import SelfGenerateQuizForm from "@/components/student/quizzes/SelfGenerateQuizForm";

import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useGenerateQuiz from "@/hooks/queries/student/useGenerateQuiz";
import { QUIZ_TAB_LABELS } from "@/features/student/constants/quizzesConfig";

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
  const [generationError, setGenerationError] = useState("");

  // React Query Hooks
  const { data: enrollments = [], isLoading: coursesLoading } = useMyCourses();
  const { data: quizzes = [], isLoading: quizzesLoading, isError } = useQuizzes(
    selectedCourse !== "all" ? selectedCourse : undefined
  );
  const generateQuizMutation = useGenerateQuiz();

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

  // Handler to self-generate a quiz using React Query mutation
  const handleSelfGenerate = () => {
    if (selectedCourse === "all") {
      setGenerationError("Please select a specific course first to generate a practice quiz.");
      return;
    }
    setGenerationError("");

    generateQuizMutation.mutate(
      { courseId: selectedCourse, numQuestions },
      {
        onSuccess: (quiz) => {
          router.push(`/student/attempt/${quiz.id}`);
        },
        onError: (err) => {
          console.error(err);
          setGenerationError(
            err.response?.data?.message ||
              "No questions found in this course to generate a practice quiz."
          );
        },
      }
    );
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
            {coursesList.map((course) => (
              <QuizCourseCard
                key={course.id}
                course={course}
                setViewingCourseId={setViewingCourseId}
                setActiveTab={setActiveTab}
              />
            ))}
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
                {QUIZ_TAB_LABELS[activeTab] || QUIZ_TAB_LABELS.reports}
              </span>
            </div>
          </div>

          {/* Content render block */}
          {activeTab === "reports" ? (
            <QuizReportsView reportStats={reportStats} filteredByCourse={filteredByCourse} />
          ) : activeTab === "self_generate" ? (
            <SelfGenerateQuizForm
              coursesList={coursesList}
              selectedCourse={selectedCourse}
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              onGenerate={handleSelfGenerate}
              isGenerating={generateQuizMutation.isPending}
              generationError={generationError}
            />
          ) : (
            <div className="space-y-5">
              <QuizTable quizzes={displayList} />
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