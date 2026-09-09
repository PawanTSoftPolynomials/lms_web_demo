"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Award,
  ArrowLeft,
  XCircle,
  RefreshCw,
  HelpCircle,
  BookOpen,
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
  // The page that launched this quiz (set via ?from= on the attempt link) —
  // takes priority over guessing from the quiz's own lessonId, since the
  // Assessment Quiz panel lists every quiz for the whole course on every
  // lesson's page, so a quiz's own lessonId doesn't reliably match the
  // specific lesson the student actually launched it from.
  const returnTo = searchParams.get("from");
  const { data, isLoading, isError } = useQuizResult(quizId);

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

  // A lesson-launched quiz should return the student to that lesson, not
  // strand them on the disconnected top-level Quizzes hub. Prefer the exact
  // page the quiz was launched from (returnTo); fall back to a guess from
  // the quiz's own lessonId; otherwise land on the Quizzes hub.
  const backHref =
    returnTo ||
    (quiz?.lessonId ? `/student/learn/${quiz.courseId}?lessonId=${quiz.lessonId}` : "/student/quizzes");
  const backLabel = backHref.startsWith("/student/learn/") ? "Back to Lesson" : "Back to Quizzes";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Quiz Performance Report"
          subtitle={`Detailed review for ${quiz?.title || "Quiz"}`}
        />
        <Link href={backHref}>
          <Button className="flex items-center gap-2 border border-transparent bg-background/50 hover:bg-muted text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      {/* Result Overview Banner */}
      <Card className={`p-8 border-l-[6px] relative overflow-hidden ${
        passed 
          ? "border-l-emerald-500 bg-emerald-950/10 border-emerald-900/40" 
          : "border-l-rose-500 bg-rose-950/10 border-rose-900/40"
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none style-glow" 
          style={{ backgroundColor: passed ? "#10b981" : "#f43f5e" }}
        />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className={`p-4.5 rounded-full flex items-center justify-center ${
            passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          }`}>
            <Award className="h-10 w-10" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              passed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
            }`}>
              {passed ? "PASSED" : "FAILED"}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {passed ? "Congratulations! You Cleared It." : "Keep Practicing, You'll Get It Next Time!"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Attempt submitted on {new Date(submittedAt).toLocaleDateString([], { dateStyle: "long" })} at {new Date(submittedAt).toLocaleTimeString([], { timeStyle: "short" })}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link href={`/student/attempt/${quizId}`}>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-foreground shadow-md hover:scale-105 active:scale-95 transition-all">
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* KPI Performance Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-transparent bg-background/40 p-5 backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Score</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">
            {score} <span className="text-xs text-muted-foreground font-normal">/ {totalMarks} Marks</span>
          </p>
        </div>

        <div className="rounded-2xl border border-transparent bg-background/40 p-5 backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Percentage</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">
            {percentage}%
          </p>
        </div>

        <div className="rounded-2xl border border-transparent bg-background/40 p-5 backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Passing Criteria</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">
            {passingScore}% <span className="text-xs text-muted-foreground font-normal">or above</span>
          </p>
        </div>

        <div className="rounded-2xl border border-transparent bg-background/40 p-5 backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Questions Answered</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">
            {parsedAnswers.length} <span className="text-xs text-muted-foreground font-normal">/ {quiz?.questions?.length || 0}</span>
          </p>
        </div>
      </section>

      {/* Concept Performance Analysis */}
      {conceptScores && Object.keys(conceptScores).length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Concept-wise Performance Analysis
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Review which concepts are well understood and which need practice.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                <Card key={conceptName} className={`p-5 border-transparent bg-background/30 flex flex-col justify-between gap-4 border-l-[4px] ${
                  isPassed ? "border-l-emerald-500" : "border-l-orange-500"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{conceptName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {cData.score} / {cData.total} Marks
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
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

      {/* Detailed Question Review List */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            Detailed Question Review
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Review your selections alongside correct options.</p>
        </div>

        <div className="space-y-5">
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