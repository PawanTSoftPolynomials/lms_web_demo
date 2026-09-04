"use client";

import { Check, X, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

import Card from "@/components/ui/Card";
import { checkAnswerCorrectness } from "@/lib/quizAnswers";

// One question's row in the "Detailed Question Review" list — options review
// for MCQ types, plus dedicated layouts for ARRANGE_TOKENS/MATCH_PAIRS/
// SELF_ASSESSMENT, each showing the student's answer against the correct one.
export default function QuestionReviewCard({ question, index, userAnswer }) {
  const qType = question.type || "MCQ_SINGLE";
  const selectedOption = userAnswer?.answer ?? userAnswer?.selectedOption;
  const isCorrect = checkAnswerCorrectness(qType, selectedOption, question.correctAnswer);

  // Format option text mapping
  let optionsList = [];
  if (qType === "MCQ_SINGLE" || qType === "MCQ_MULTI") {
    if (typeof question.options === "string") {
      try {
        optionsList = JSON.parse(question.options);
      } catch {
        optionsList = [question.options];
      }
    } else if (Array.isArray(question.options)) {
      optionsList = question.options;
    }
  }

  return (
    <Card className="p-6 border-border bg-background/30">
      <div className="flex items-start gap-4">
        {/* Number Badge */}
        <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground border border-transparent/50">
          {index + 1}
        </span>

        <div className="flex-1 space-y-4 min-w-0">
          {/* Question Title & Marks */}
          <div className="flex justify-between items-start gap-4">
            <h4 className="text-sm font-semibold text-foreground leading-relaxed break-words flex-1">
              {question.question}
            </h4>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-border text-muted-foreground font-bold uppercase">
                {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
              </span>
              {question.concept && (
                <span className="text-[9px] text-primary font-semibold uppercase">
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
                const optionText = typeof option === "string" ? option : (option?.optionText || option?.text || String(option));
                const isSelected = qType === "MCQ_SINGLE"
                  ? selectedOption === optionText || selectedOption === option
                  : Array.isArray(selectedOption) && (selectedOption.includes(optionText) || selectedOption.includes(option));
                const isAnswerCorrect = qType === "MCQ_SINGLE"
                  ? optionText === question.correctAnswer || (typeof option === "object" && option?.isCorrect)
                  : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optionText);

                let optionStyle = "border-border bg-background/40 text-muted-foreground";
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
                  optionStyle = "border-emerald-500/25 bg-emerald-500/5 text-emerald-400";
                  badgeIcon = <Check className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />;
                }

                return (
                  <div
                    key={optIdx}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition ${optionStyle}`}
                  >
                    <span className="pr-4 break-words">{optionText}</span>
                    {badgeIcon}
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. ARRANGE_TOKENS Review */}
          {qType === "ARRANGE_TOKENS" && (
            <div className="space-y-3 bg-background/40 p-4 rounded-xl border border-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your Sequence:</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedOption) && selectedOption.length > 0 ? (
                    selectedOption.map((token, tIdx) => {
                      const tokenText = typeof token === "string" ? token : (token?.optionText || token?.text || String(token));
                      const isCorrectPos = Array.isArray(question.correctAnswer) && question.correctAnswer[tIdx] === tokenText;
                      return (
                        <span key={tIdx} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          isCorrectPos ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          <span className="text-[9px] opacity-60 font-bold">{tIdx + 1}</span>
                          {tokenText}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not Answered</span>
                  )}
                </div>
              </div>

              {!isCorrect && Array.isArray(question.correctAnswer) && (
                <div className="space-y-2 border-t border-transparent/50 pt-3 mt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Correct Sequence:</span>
                  <div className="flex flex-wrap gap-2">
                    {question.correctAnswer.map((token, tIdx) => {
                      const tokenText = typeof token === "string" ? token : (token?.optionText || token?.text || String(token));
                      return (
                        <span key={tIdx} className="bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-transparent/40">
                          <span className="text-[9px] text-muted-foreground font-bold">{tIdx + 1}</span>
                          {tokenText}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MATCH_PAIRS Review */}
          {qType === "MATCH_PAIRS" && (
            <div className="space-y-3 bg-background/40 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Matches Review:</span>
              <div className="grid gap-3">
                {Object.entries(question.correctAnswer || {}).map(([leftItem, rightItem]) => {
                  const studentMatch = selectedOption?.[leftItem] || "";
                  const isMatchCorrect = studentMatch === rightItem;

                  return (
                    <div key={leftItem} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border text-xs gap-3 ${
                      isMatchCorrect
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                        : "border-rose-500/20 bg-rose-500/5 text-rose-400"
                    }`}>
                      <div className="font-semibold flex items-center gap-2">
                        <span>{leftItem}</span>
                        <ArrowRight size={14} className="opacity-50" />
                        <span className="underline">{studentMatch || "(No Match Selected)"}</span>
                      </div>
                      {!isMatchCorrect && (
                        <div className="text-[10px] text-muted-foreground font-medium">
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
              <div className="bg-background/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your Written Answer:</span>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {selectedOption || "(No response typed)"}
                </p>
              </div>
              <div className="bg-background/20 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Evaluation Rubric & Key:</span>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {question.correctAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Result Summary Bar */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-transparent/60">
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
                    <span>Incorrect Choice</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold italic">
                <XCircle size={14} />
                <span>Not Answered</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
