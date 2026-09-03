"use client";

import { useMemo } from "react";
import { Bookmark } from "lucide-react";
import OptionList from "./OptionList";
import MCQMultiOptionList from "./MCQMultiOptionList";
import ArrangeTokensList from "./ArrangeTokensList";
import MatchPairsGrid from "./MatchPairsGrid";
import SelfAssessmentInput from "./SelfAssessmentInput";

export default function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  isBookmarked = false,
  onToggleBookmark,
}) {
  const type = question?.type || "MCQ_SINGLE";

  // Deterministic-ish stable random shuffle helper for single option, multioption, and arrange tokens
  const shuffledOptions = useMemo(() => {
    if (!question?.options) return [];
    let opts = question.options;
    if (typeof opts === "string") {
      try {
        opts = JSON.parse(opts);
      } catch {
        opts = [];
      }
    }
    if (!Array.isArray(opts)) return [];

    return [...opts].sort(() => Math.random() - 0.5);
  }, [question]);

  // Deterministic-ish stable random shuffle for Match Pairs column B (Right side options)
  const shuffledMatchOptions = useMemo(() => {
    if (type !== "MATCH_PAIRS" || !question?.options) return {};

    let opts = question.options;
    if (typeof opts === "string") {
      try {
        opts = JSON.parse(opts);
      } catch {
        opts = {};
      }
    }

    const colA = opts?.columnA || opts?.left || [];
    const colB = opts?.columnB || opts?.right || [];

    return {
      columnA: colA,
      columnB: [...colB].sort(() => Math.random() - 0.5),
    };
  }, [question, type]);

  if (!question) return null;

  return (
    <div className="rounded-2xl border border-border bg-background p-3 sm:p-4 shadow-xl">
      {/* Question Progress Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion} of {totalQuestions}
          </p>

          <div className="mt-1.5 h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(currentQuestion / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {question.concept && (
            <div className="hidden sm:block rounded-lg bg-muted border border-transparent px-2.5 py-1 text-xs font-medium text-foreground">
              Concept: <span className="text-primary font-semibold">{question.concept}</span>
            </div>
          )}

          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                isBookmarked
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-transparent bg-muted text-muted-foreground hover:text-primary"
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>
          )}

          <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary whitespace-nowrap">
            {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-semibold leading-snug text-foreground">
          {question.question}
        </h2>
      </div>

      {/* Options Rendering per Question Type */}
      <div>
        {type === "MCQ_SINGLE" && (
          <OptionList
            options={shuffledOptions}
            selectedAnswer={selectedAnswer}
            onSelect={onSelectAnswer}
          />
        )}
        {type === "MCQ_MULTI" && (
          <MCQMultiOptionList
            options={shuffledOptions}
            selectedAnswers={selectedAnswer || []}
            onSelect={onSelectAnswer}
          />
        )}
        {type === "ARRANGE_TOKENS" && (
          <ArrangeTokensList
            options={shuffledOptions}
            selectedOrder={selectedAnswer || []}
            onOrderChange={onSelectAnswer}
          />
        )}
        {type === "MATCH_PAIRS" && (
          <MatchPairsGrid
            options={shuffledMatchOptions}
            selectedPairs={selectedAnswer || {}}
            onPairsChange={onSelectAnswer}
          />
        )}
        {type === "SELF_ASSESSMENT" && (
          <SelfAssessmentInput
            value={selectedAnswer || ""}
            onChange={onSelectAnswer}
          />
        )}
      </div>
    </div>
  );
}