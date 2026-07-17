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
  X,
  BookOpen,
  ArrowRight
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import useQuizResult from "@/hooks/queries/student/useQuizResult";

const renderMarkdown = (text) => {
  if (!text) return "";
  let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^### (.*?)$/gm, "<h3 class='text-sm font-bold text-white mt-2 mb-1'>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 class='text-base font-bold text-white mt-3 mb-1.5'>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 class='text-lg font-bold text-white mt-3 mb-1.5'>$1</h1>");
  html = html.replace(/^\-\s+(.*?)$/gm, "<li class='list-disc list-inside ml-2 text-slate-300'>$1</li>");
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-800 px-1 py-0.5 rounded text-orange-400 font-mono text-[11px]'>$1</code>");
  html = html.split("\n").join("<br/>");
  return html;
};

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
    return submission.answers;
  }, [submission]);

  const checkAnswerCorrectness = (type, selected, correct) => {
    if (selected === undefined || selected === null) return false;
    
    if (type === "MCQ_SINGLE") {
      return selected === correct;
    }
    
    if (type === "MCQ_MULTI") {
      if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
      return selected.length === correct.length && selected.every(v => correct.includes(v));
    }
    
    if (type === "ARRANGE_TOKENS") {
      if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
      return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
    }
    
    if (type === "MATCH_PAIRS") {
      if (typeof selected !== "object" || typeof correct !== "object" || !selected || !correct) return false;
      const selKeys = Object.keys(selected);
      const corrKeys = Object.keys(correct);
      if (selKeys.length !== corrKeys.length) return false;
      return selKeys.every(k => String(selected[k]) === String(correct[k]));
    }
    
    if (type === "SELF_ASSESSMENT") {
      return typeof selected === "string" && selected.trim().length > 0;
    }
    
    return false;
  };

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

  const { quiz, score, totalMarks, percentage, passed, submittedAt, conceptScores } = submission;
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Score</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {score} <span className="text-xs text-slate-500 font-normal">/ {totalMarks} Marks</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Percentage</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {percentage}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Passing Criteria</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {passingScore}% <span className="text-xs text-slate-500 font-normal">or above</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Questions Answered</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {parsedAnswers.length} <span className="text-xs text-slate-500 font-normal">/ {quiz?.questions?.length || 0}</span>
          </p>
        </div>
      </section>

      {/* Concept Performance Analysis */}
      {conceptScores && Object.keys(conceptScores).length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-orange-500" />
              Concept-wise Performance Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-1">Review which concepts are well understood and which need practice.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(conceptScores).map(([conceptName, cData]) => {
              const perc = cData.percentage ?? 0;
              const isPassed = perc >= passingScore;
              
              let barColor = "bg-rose-500";
              let textColor = "text-rose-450";
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
                <Card key={conceptName} className={`p-5 border-slate-800 bg-slate-900/30 flex flex-col justify-between gap-4 border-l-[4px] ${
                  isPassed ? "border-l-emerald-500" : "border-l-orange-550"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{conceptName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {cData.score} / {cData.total} Marks
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {perc}%
                    </span>
                  </div>

                  <div className="w-full space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-orange-500" />
            Detailed Question Review
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review your selections alongside correct options.</p>
        </div>

        <div className="space-y-5">
          {quiz?.questions?.map((question, index) => {
            const qType = question.type || "MCQ_SINGLE";
            const userAnswer = parsedAnswers.find(ans => ans.questionId === question.id);
            const selectedOption = userAnswer?.selectedOption;
            const isCorrect = checkAnswerCorrectness(qType, selectedOption, question.correctAnswer);
            
            // Format option text mapping
            let optionsList = [];
            if (qType === "MCQ_SINGLE" || qType === "MCQ_MULTI") {
              if (typeof question.options === "string") {
                try {
                  optionsList = JSON.parse(question.options);
                } catch (e) {
                  optionsList = [question.options];
                }
              } else if (Array.isArray(question.options)) {
                optionsList = question.options;
              }
            }

            return (
              <Card key={question.id} className="p-6 border-slate-800 bg-slate-900/30">
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700/50">
                    {index + 1}
                  </span>

                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Question Title & Marks */}
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-semibold text-slate-100 leading-relaxed break-words flex-1">
                        {question.question}
                      </h4>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-bold uppercase">
                          {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                        </span>
                        {question.concept && (
                          <span className="text-[9px] text-orange-400 font-semibold uppercase">
                            {question.concept}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conditional Display per Question Type */}

                    {/* 1. MCQ_SINGLE / MCQ_MULTI Options Review */}
                    {(qType === "MCQ_SINGLE" || qType === "MCQ_MULTI") && (
                      <div className="grid gap-2.5">
                        {optionsList.map((option, optIdx) => {
                          const isSelected = qType === "MCQ_SINGLE" 
                            ? selectedOption === option
                            : Array.isArray(selectedOption) && selectedOption.includes(option);
                          const isAnswerCorrect = qType === "MCQ_SINGLE"
                            ? option === question.correctAnswer
                            : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option);
                          
                          let optionStyle = "border-slate-800 bg-slate-950/40 text-slate-400";
                          let badgeIcon = null;

                          if (isSelected) {
                            if (isAnswerCorrect) {
                              optionStyle = "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-medium";
                              badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
                            } else {
                              optionStyle = "border-rose-500/30 bg-rose-500/5 text-rose-300 font-medium";
                              badgeIcon = <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
                            }
                          } else if (isAnswerCorrect) {
                            optionStyle = "border-emerald-500/25 bg-emerald-500/5 text-emerald-450";
                            badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />;
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition ${optionStyle}`}
                            >
                              <span className="pr-4 break-words">{option}</span>
                              {badgeIcon}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. ARRANGE_TOKENS Review */}
                    {qType === "ARRANGE_TOKENS" && (
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Sequence:</span>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(selectedOption) && selectedOption.length > 0 ? (
                              selectedOption.map((token, tIdx) => {
                                const isCorrectPos = Array.isArray(question.correctAnswer) && question.correctAnswer[tIdx] === token;
                                return (
                                  <span key={tIdx} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                                    isCorrectPos ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                                  }`}>
                                    <span className="text-[9px] opacity-60 font-bold">{tIdx + 1}</span>
                                    {token}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-slate-500 italic">Not Answered</span>
                            )}
                          </div>
                        </div>

                        {!isCorrect && Array.isArray(question.correctAnswer) && (
                          <div className="space-y-2 border-t border-slate-900/50 pt-3 mt-2">
                            <span className="text-[10px] text-slate-505 font-bold uppercase tracking-wider">Correct Sequence:</span>
                            <div className="flex flex-wrap gap-2">
                              {question.correctAnswer.map((token, tIdx) => (
                                <span key={tIdx} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700/40">
                                  <span className="text-[9px] text-slate-500 font-bold">{tIdx + 1}</span>
                                  {token}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. MATCH_PAIRS Review */}
                    {qType === "MATCH_PAIRS" && (
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Matches Review:</span>
                        <div className="grid gap-3">
                          {Object.entries(question.correctAnswer || {}).map(([leftItem, rightItem]) => {
                            const studentMatch = selectedOption?.[leftItem] || "";
                            const isMatchCorrect = studentMatch === rightItem;

                            return (
                              <div key={leftItem} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border text-xs gap-3 ${
                                isMatchCorrect 
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-450"
                                  : "border-rose-500/20 bg-rose-500/5 text-rose-455"
                              }`}>
                                <div className="font-semibold flex items-center gap-2">
                                  <span>{leftItem}</span>
                                  <ArrowRight size={14} className="opacity-50" />
                                  <span className="underline">{studentMatch || "(No Match Selected)"}</span>
                                </div>
                                {!isMatchCorrect && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    Expected Match: <span className="text-emerald-400 font-bold">{rightItem}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. SELF_ASSESSMENT Review */}
                    {qType === "SELF_ASSESSMENT" && (
                      <div className="space-y-3">
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Written Answer:</span>
                          <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                            {selectedOption || "(No response typed)"}
                          </p>
                        </div>
                        <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Evaluation Rubric & Key:</span>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Result Summary Bar */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-900/60">
                      {selectedOption ? (
                        <>
                          {isCorrect ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 size={14} />
                              <span>Correct Choice</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-rose-455 font-semibold">
                              <XCircle size={14} />
                              <span>Incorrect Choice</span>
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