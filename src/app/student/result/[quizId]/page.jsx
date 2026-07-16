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

const arraysEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

const arraysEqualOrdered = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

const objectsEqual = (objA, objB) => {
  if (typeof objA !== "object" || typeof objB !== "object" || !objA || !objB) return false;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => String(objA[key]) === String(objB[key]));
};

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

  const renderQuestionReview = (question, userAnswer) => {
    const selectedOption = userAnswer?.selectedOption;
    const type = question.type || "MCQ_SINGLE";
    const corr = question.correctAnswer;

    let isCorrect = false;
    if (selectedOption !== undefined && selectedOption !== null) {
      if (type === "MCQ_SINGLE") {
        isCorrect = (selectedOption === corr);
      } else if (type === "MCQ_MULTI") {
        isCorrect = arraysEqual(selectedOption, corr);
      } else if (type === "ARRANGE_TOKENS") {
        isCorrect = arraysEqualOrdered(selectedOption, corr);
      } else if (type === "MATCH_PAIRS") {
        isCorrect = objectsEqual(selectedOption, corr);
      } else if (type === "SELF_ASSESSMENT") {
        isCorrect = (typeof selectedOption === "string" && selectedOption.trim().length > 0);
      }
    }

    // Options mapping helper
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
      <div className="space-y-4">
        {/* MCQ Single / Multi */}
        {(type === "MCQ_SINGLE" || type === "MCQ_MULTI") && (
          <div className="grid gap-2.5">
            {optionsList.map((option, optIdx) => {
              const isSelected = type === "MCQ_SINGLE" 
                ? (selectedOption === option)
                : (Array.isArray(selectedOption) && selectedOption.includes(option));
                
              const isAnswerCorrect = type === "MCQ_SINGLE"
                ? (option === corr)
                : (Array.isArray(corr) && corr.includes(option));

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
                optionStyle = "border-emerald-500/25 bg-emerald-500/5 text-emerald-400/80";
                badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-500" />;
              }

              return (
                <div key={optIdx} className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition ${optionStyle}`}>
                  <span>{option}</span>
                  {badgeIcon}
                </div>
              );
            })}
          </div>
        )}

        {/* ARRANGE_TOKENS */}
        {type === "ARRANGE_TOKENS" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Your Order:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-3 rounded-lg space-y-1.5 text-xs">
                {Array.isArray(selectedOption) ? (
                  selectedOption.map((tok, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-900 rounded text-slate-300">
                      <span className="text-[10px] bg-slate-850 px-1.5 py-0.5 rounded text-orange-400 font-bold">{idx + 1}</span>
                      <span>{tok}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 italic">Not answered</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Correct Sequence:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-3 rounded-lg space-y-1.5 text-xs">
                {Array.isArray(corr) && corr.map((tok, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-900 rounded text-emerald-300 font-medium">
                    <span className="text-[10px] bg-slate-850 px-1.5 py-0.5 rounded text-emerald-500 font-bold">{idx + 1}</span>
                    <span>{tok}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MATCH_PAIRS */}
        {type === "MATCH_PAIRS" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Your Matches:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-3 rounded-lg space-y-2 text-xs">
                {selectedOption && Object.keys(selectedOption).length > 0 ? (
                  Object.entries(selectedOption).map(([k, v]) => {
                    const isMatchCorrect = corr[k] === v;
                    return (
                      <div key={k} className="flex items-center justify-between p-1.5 bg-slate-900 rounded">
                        <span className="font-medium text-slate-300">{k}</span>
                        <span className="text-slate-600 font-bold">➔</span>
                        <span className={`font-semibold flex items-center gap-1.5 ${
                          isMatchCorrect ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {v} {isMatchCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-600 italic">Not matched</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Correct Connections:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-3 rounded-lg space-y-2 text-xs">
                {corr && Object.entries(corr).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-1.5 bg-slate-900 rounded">
                    <span className="font-medium text-slate-300">{k}</span>
                    <span className="text-slate-600 font-bold">➔</span>
                    <span className="font-semibold text-emerald-400">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SELF_ASSESSMENT */}
        {type === "SELF_ASSESSMENT" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Your Response:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-4 rounded-lg text-slate-300 text-xs overflow-auto leading-relaxed select-text min-h-[140px]">
                {selectedOption ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedOption) }} />
                ) : (
                  <p className="text-slate-600 italic">No explanation submitted</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">Rubric & Model Answer:</h5>
              <div className="bg-slate-950/50 border border-slate-855 p-4 rounded-lg text-emerald-300 text-xs overflow-auto leading-relaxed select-text min-h-[140px]">
                {corr ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(corr) }} />
                ) : (
                  <p className="text-slate-600 italic">No model explanation provided</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar Summary */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-950">
          {selectedOption ? (
            <>
              {isCorrect ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 size={14} />
                  <span>Correct</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                  <XCircle size={14} />
                  <span>Incorrect</span>
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
    );
  };

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

      {/* Concept Performance Analysis */}
      {conceptScores && Object.keys(conceptScores).length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award size={20} className="text-orange-500" />
              Concept-wise Performance Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-1">Review which concepts are well understood and which need practice.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(conceptScores).map(([conceptName, cData]) => {
              const isPassed = cData.percentage >= passingScore;
              return (
                <Card key={conceptName} className={`p-5 border-slate-800 bg-slate-900/30 flex flex-col justify-between gap-4 border-l-[4px] ${
                  isPassed ? "border-l-emerald-500" : "border-l-orange-500"
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
                      {cData.percentage}%
                    </span>
                  </div>

                  <div className="w-full space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPassed ? "bg-emerald-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${cData.percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 text-right">
                      {isPassed ? "Well understood" : "Needs practice"}
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
            const userAnswer = parsedAnswers.find(ans => ans.questionId === question.id);
            const selectedOption = userAnswer?.selectedOption;
            const type = question.type || "MCQ_SINGLE";
            const corr = question.correctAnswer;
            
            let isCorrect = false;
            if (selectedOption !== undefined && selectedOption !== null) {
              if (type === "MCQ_SINGLE") {
                isCorrect = (selectedOption === corr);
              } else if (type === "MCQ_MULTI") {
                isCorrect = arraysEqual(selectedOption, corr);
              } else if (type === "ARRANGE_TOKENS") {
                isCorrect = arraysEqualOrdered(selectedOption, corr);
              } else if (type === "MATCH_PAIRS") {
                isCorrect = objectsEqual(selectedOption, corr);
              } else if (type === "SELF_ASSESSMENT") {
                isCorrect = (typeof selectedOption === "string" && selectedOption.trim().length > 0);
              }
            }

            return (
              <Card key={question.id} className="p-6 border-slate-800 bg-slate-900/30">
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700/50">
                    {index + 1}
                  </span>

                  <div className="flex-1 space-y-4">
                    {/* Question Title & Marks */}
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                        {question.question}
                      </h4>
                      <span className="flex-shrink-0 text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-bold uppercase">
                        {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                      </span>
                    </div>

                    {/* Question concept tag inside review */}
                    {question.concept && (
                      <div className="inline-flex rounded-lg bg-slate-850 px-2 py-1 text-[10px] text-slate-450 border border-slate-800">
                        Concept: <span className="text-orange-400 font-semibold ml-1">{question.concept}</span>
                      </div>
                    )}

                    {/* Dynamic Question Review Renderer */}
                    {renderQuestionReview(question, userAnswer)}

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