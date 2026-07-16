"use client";


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
}) {
  if (!question) return null;

  const type = question.type || "MCQ_SINGLE";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      {/* Question Progress Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Question {currentQuestion} of {totalQuestions}
          </p>

          <div className="mt-3 h-2 w-56 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{
                width: `${(currentQuestion / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            {question.concept && (
              <div className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300">
                Concept: <span className="text-orange-400 font-semibold">{question.concept}</span>
              </div>
            )}
            <div className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Type: {type.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold leading-relaxed text-white">
          {question.question}
        </h2>
      </div>

      {/* Options Rendering per Question Type */}
      <div className="mt-6">
        {type === "MCQ_SINGLE" && (
          <OptionList
            options={question.options}
            selectedAnswer={selectedAnswer}
            onSelect={onSelectAnswer}
          />
        )}
        {type === "MCQ_MULTI" && (
          <MCQMultiOptionList
            options={question.options}
            selectedAnswers={selectedAnswer || []}
            onSelect={onSelectAnswer}
          />
        )}
        {type === "ARRANGE_TOKENS" && (
          <ArrangeTokensList
            options={question.options}
            selectedOrder={selectedAnswer || []}
            onOrderChange={onSelectAnswer}
          />
        )}
        {type === "MATCH_PAIRS" && (
          <MatchPairsGrid
            options={question.options}
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