"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HelpCircle,
  Check,
  X
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import useQuizResult from "@/hooks/queries/student/useQuizResult";

export default function QuizResultPage() {
  const { quizId } = useParams();
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
    return Array.isArray(submission.answers) ? submission.answers : [];
  }, [submission?.answers]);

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
            <h2 className="text-xl font-bold text-white">Result Not Found</h2>
            <p className="mt-2 text-slate-400">
              Either you have not attempted this quiz yet, or there was an error retrieving your submission.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/student/quizzes">
                <Button className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Quizzes
                </Button>
              </Link>
              <Link href={`/student/attempt/${quizId}`}>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Attempt Quiz Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { quiz, score, totalMarks, percentage, passed, submittedAt } = submission;
  const passingScore = quiz?.passingScore ?? 70;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Quiz Performance Report"
          subtitle={`Detailed review for ${quiz?.title || "Quiz"}`}
        />
        <Link href="/student/quizzes">
          <Button className="flex items-center gap-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {passed ? "Congratulations! You Cleared It." : "Keep Practicing, You'll Get It Next Time!"}
            </h2>
            <p className="text-xs text-slate-400">
              Attempt submitted on {new Date(submittedAt).toLocaleDateString([], { dateStyle: "long" })} at {new Date(submittedAt).toLocaleTimeString([], { timeStyle: "short" })}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link href={`/student/attempt/${quizId}`}>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md hover:scale-105 active:scale-95 transition-all">
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* KPI Performance Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Score</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {score} <span className="text-xs text-slate-500 font-normal">/ {totalMarks} Marks</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Percentage</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {percentage}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Passing Criteria</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {passingScore}% <span className="text-xs text-slate-500 font-normal">or above</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Questions Answered</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {parsedAnswers.length} <span className="text-xs text-slate-500 font-normal">/ {quiz?.questions?.length || 0}</span>
          </p>
        </div>
      </section>

      {/* Detailed Question Review List */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-orange-500" />
            Detailed Question Review
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review your selections alongside correct options.</p>
        </div>

        <div className="space-y-5">
          {quiz?.questions?.map((question, index) => {
            const userAnswer = parsedAnswers.find(ans => ans.questionId === question.id);
            const selectedOption = userAnswer?.selectedOption;
            const isCorrect = selectedOption === question.correctAnswer;
            
            // Handle parsing options if stored as JSON array string
            let optionsList = [];
            if (typeof question.options === "string") {
              try {
                optionsList = JSON.parse(question.options);
              } catch (e) {
                optionsList = [question.options];
              }
            } else if (Array.isArray(question.options)) {
              optionsList = question.options;
            }

            return (
              <Card key={question.id} className="p-6 border-slate-850 bg-slate-900/30">
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700/50">
                    {index + 1}
                  </span>

                  <div className="flex-1 space-y-4">
                    {/* Question Title & Marks */}
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                        {question.text}
                      </h4>
                      <span className="flex-shrink-0 text-[10px] bg-slate-850 px-2 py-0.5 rounded border border-slate-850 text-slate-400 font-bold uppercase">
                        {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                      </span>
                    </div>

                    {/* Options Stack */}
                    <div className="grid gap-2.5">
                      {optionsList.map((option, optIdx) => {
                        const isSelected = selectedOption === option;
                        const isAnswerCorrect = option === question.correctAnswer;
                        
                        let optionStyle = "border-slate-800 bg-slate-950/40 text-slate-400";
                        let badgeIcon = null;

                        if (isSelected) {
                          if (isAnswerCorrect) {
                            optionStyle = "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-medium";
                            badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-400" />;
                          } else {
                            optionStyle = "border-rose-500/30 bg-rose-500/5 text-rose-300 font-medium";
                            badgeIcon = <X className="h-3.5 w-3.5 text-rose-400" />;
                          }
                        } else if (isAnswerCorrect) {
                          // Highlight the missed correct answer
                          optionStyle = "border-emerald-500/25 bg-emerald-500/5 text-emerald-400/80";
                          badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-500" />;
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition ${optionStyle}`}
                          >
                            <span className="pr-4">{option}</span>
                            {badgeIcon}
                          </div>
                        );
                      })}
                    </div>

                    {/* Result Summary Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      {selectedOption ? (
                        <>
                          {isCorrect ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 size={14} />
                              <span>Correct Choice</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                              <XCircle size={14} />
                              <span>Incorrect Choice (Selected: {selectedOption})</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold italic">
                          <XCircle size={14} />
                          <span>Not Answered</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}