"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Award,
  ArrowLeft,
  XCircle,
  RefreshCw,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import useQuizResult from "@/hooks/queries/student/useQuizResult";
import QuestionReviewCard from "@/components/student/quiz-result/QuestionReviewCard";


function QuizResultPageContent() {
  const { quizId } = useParams();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from");
  const { data, isLoading, isError } = useQuizResult(quizId);

  const [mobileReviewIndex, setMobileReviewIndex] = useState(0);

  const submission = data?.data || data;

  const parsedAnswers = useMemo(() => {
    if (!submission?.answers) return [];
    if (typeof submission.answers === "string") {
      try {
        return JSON.parse(submission.answers);
      } catch (e) {
        console.error("Failed to parse answers JSON:", e);
        return [];
      }
    }
    return submission.answers;
  }, [submission]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !submission) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quiz Result"
          subtitle="View your quiz performance and results."
        />
        <Card className="p-10 text-center border-red-500/25 bg-red-500/5">
          <div className="mx-auto max-w-md">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-foreground">Result Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              Either you have not attempted this quiz yet, or there was an error retrieving your submission.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href={returnTo || "/student/quizzes"}>
                <Button className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {returnTo ? "Back" : "Back to Quizzes"}
                </Button>
              </Link>
              <Link href={`/student/attempt/${quizId}`}>
                <Button className="bg-primary hover:bg-orange-600">
                  Attempt Quiz Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { quiz, score, totalMarks, percentage, passed, submittedAt, conceptScores } = submission;
  const passingScore = quiz?.passingScore ?? 70;

  const backHref =
    returnTo ||
    (quiz?.lessonId ? `/student/learn/${quiz.courseId}?lessonId=${quiz.lessonId}` : "/student/quizzes");
  const backLabel = backHref.startsWith("/student/learn/") ? "Back to Lesson" : "Back to Quizzes";

  return (
    <div className="space-y-4 sm:space-y-8 max-w-5xl mx-auto pb-12 px-3 sm:px-6 w-full min-w-0 overflow-x-hidden">
      {/* Desktop Page Header with Back to Lesson button */}
      <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <PageHeader
          title="Quiz Performance Report"
          subtitle={`Detailed review for ${quiz?.title || "Quiz"}`}
        />
        <Link href={backHref} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-transparent bg-background/50 hover:bg-muted text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      {/* Mobile Page Header (No Back button, compact titles) */}
      <div className="sm:hidden space-y-0.5 min-w-0">
        <h1 className="text-base font-bold text-foreground leading-snug truncate">
          Quiz Performance Report
        </h1>
        <p className="text-xs text-muted-foreground font-medium truncate">
          {quiz?.title || "Quiz"}
        </p>
      </div>

      {/* Result Overview Banner */}
      <Card padding="" className={`p-2.5 sm:p-8 border-l-[4px] sm:border-l-[6px] relative overflow-hidden ${
        passed 
          ? "border-l-emerald-500 bg-emerald-950/10 border-emerald-900/40" 
          : "border-l-rose-500 bg-rose-950/10 border-rose-900/40"
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none style-glow" 
          style={{ backgroundColor: passed ? "#10b981" : "#f43f5e" }}
        />
        
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-6 relative z-10">
          <div className={`p-1.5 sm:p-4.5 rounded-full flex items-center justify-center shrink-0 ${
            passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          }`}>
            <Award className="h-5 w-5 sm:h-10 sm:w-10" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-0.5 sm:space-y-2">
            <div className={`inline-flex rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider ${
              passed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
            }`}>
              {passed ? "PASSED" : "FAILED"}
            </div>
            <h2 className="text-xs sm:text-2xl md:text-3xl font-bold text-foreground leading-tight sm:leading-snug">
              {passed ? "Congratulations! You Cleared It." : "Keep Practicing, You'll Get It Next Time!"}
            </h2>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              Attempt submitted on {new Date(submittedAt).toLocaleDateString([], { dateStyle: "long" })} at {new Date(submittedAt).toLocaleTimeString([], { timeStyle: "short" })}
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link href={`/student/attempt/${quizId}`}>
              <Button className="w-full sm:w-auto h-8 sm:h-10 text-[11px] sm:text-sm px-3 sm:px-4 py-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-foreground shadow-md hover:scale-105 active:scale-95 transition-all">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                Retake Quiz
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* KPI Performance Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-5 min-w-0">
        <div className="rounded-xl sm:rounded-2xl border border-transparent bg-background/40 p-2 sm:p-5 backdrop-blur-md min-w-0">
          <p className="text-[9px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">Your Score</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold text-foreground">
            {score} <span className="text-[9px] sm:text-xs text-muted-foreground font-normal">/ {totalMarks}</span>
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-transparent bg-background/40 p-2 sm:p-5 backdrop-blur-md min-w-0">
          <p className="text-[9px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">Percentage</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold text-foreground">
            {percentage}%
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-transparent bg-background/40 p-2 sm:p-5 backdrop-blur-md min-w-0">
          <p className="text-[9px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">Passing Criteria</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold text-foreground">
            {passingScore}% <span className="text-[9px] sm:text-xs text-muted-foreground font-normal">or above</span>
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-transparent bg-background/40 p-2 sm:p-5 backdrop-blur-md min-w-0">
          <p className="text-[9px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">Questions Answered</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold text-foreground">
            {parsedAnswers.length} <span className="text-[9px] sm:text-xs text-muted-foreground font-normal">/ {quiz?.questions?.length || 0}</span>
          </p>
        </div>
      </section>

      {/* Concept Performance Analysis */}
      {conceptScores && Object.keys(conceptScores).length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary shrink-0 sm:w-5 sm:h-5" />
              Concept-wise Performance Analysis
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Review which concepts are well understood and which need practice.</p>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {Object.entries(conceptScores).map(([conceptName, cData]) => {
              const perc = cData.percentage ?? 0;
              const isPassed = perc >= passingScore;
              
              let barColor = "bg-rose-500";
              let textColor = "text-rose-400";
              let label = "Needs practice";
              
              if (perc >= 75) {
                barColor = "bg-emerald-500";
                textColor = "text-emerald-400";
                label = "Well understood";
              } else if (perc >= 50) {
                barColor = "bg-amber-500";
                textColor = "text-amber-400";
                label = "Getting there";
              }

              return (
                <Card padding="" key={conceptName} className={`p-3.5 sm:p-5 border-transparent bg-background/30 flex flex-col justify-between gap-3 sm:gap-4 border-l-[4px] ${
                  isPassed ? "border-l-emerald-500" : "border-l-orange-500"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground">{conceptName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {cData.score} / {cData.total} Marks
                      </p>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                      isPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                    }`}>
                      {perc}%
                    </span>
                  </div>

                  <div className="w-full space-y-1">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                    <p className={`text-[10px] text-right font-medium ${textColor}`}>
                      {label}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Detailed Question Review List / Mobile Slider */}
      <section className="space-y-3 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle size={18} className="text-primary shrink-0 sm:w-5 sm:h-5" />
            Detailed Question Review
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Review your selections alongside correct options.</p>
        </div>

        {/* Mobile Question Review Slider (sm:hidden) */}
        {quiz?.questions?.length > 0 && (
          <div className="sm:hidden space-y-2">
            {/* Single Question Review Card */}
            {quiz.questions[mobileReviewIndex] && (
              <QuestionReviewCard
                key={quiz.questions[mobileReviewIndex].id}
                question={quiz.questions[mobileReviewIndex]}
                index={mobileReviewIndex}
                userAnswer={parsedAnswers.find((ans) => ans.questionId === quiz.questions[mobileReviewIndex].id)}
              />
            )}

            {/* Unified Mobile Question Navigation Container */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-1 rounded-xl border border-border bg-background/50 backdrop-blur-md p-1 min-w-0 shadow-sm">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setMobileReviewIndex((prev) => Math.max(0, prev - 1))}
                  disabled={mobileReviewIndex === 0}
                  title="Previous Question"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Scrollable Question Number Strip */}
                <div className="flex flex-1 min-w-0 items-center justify-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-1">
                  {quiz.questions.map((q, idx) => {
                    const isCurrent = idx === mobileReviewIndex;
                    return (
                      <button
                        key={q.id || idx}
                        type="button"
                        onClick={() => setMobileReviewIndex(idx)}
                        title={`Go to question ${idx + 1}`}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setMobileReviewIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                  disabled={mobileReviewIndex >= quiz.questions.length - 1}
                  title="Next Question"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Secondary Subordinate Position Indicator */}
              <p className="text-[10px] font-semibold text-muted-foreground text-center">
                Question {mobileReviewIndex + 1} of {quiz.questions.length}
              </p>
            </div>
          </div>
        )}

        {/* Desktop Vertical Stack (hidden sm:block) */}
        <div className="hidden sm:block space-y-5">
          {quiz?.questions?.map((question, index) => (
            <QuestionReviewCard
              key={question.id}
              question={question}
              index={index}
              userAnswer={parsedAnswers.find((ans) => ans.questionId === question.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function QuizResultPage() {
  return (
    <Suspense fallback={<Loader />}>
      <QuizResultPageContent />
    </Suspense>
  );
}