"use client";

import { useMemo } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import OptionList from "./OptionList";

export default function QuestionCard({
                                       question,
                                       currentQuestion,
                                       totalQuestions,
                                       selectedAnswer,
                                       onSelectAnswer,
                                     }) {
  if (!question) return null;

  const type = question.type || "MCQ_SINGLE";

  // MCQ_MULTI toggles
  const handleMultiToggle = (option) => {
    const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    onSelectAnswer(updated);
  };

  // ARRANGE_TOKENS shuffling pool
  const tokenPool = useMemo(() => {
    if (type !== "ARRANGE_TOKENS" || !Array.isArray(question.options)) return [];
    return [...question.options].sort(() => {
      // Shuffles based on question ID hash to keep shuffle stable per question load
      let sum = 0;
      for (let i = 0; i < (question.id || "").length; i++) {
        sum += (question.id || "").charCodeAt(i);
      }
      return (sum % 2 === 0 ? 0.5 : -0.5) - Math.random();
    });
  }, [question.id, question.options, type]);

  const arrangedSequence = Array.isArray(selectedAnswer) ? selectedAnswer : [];

  const handleTokenPoolClick = (token) => {
    if (arrangedSequence.includes(token)) return;
    onSelectAnswer([...arrangedSequence, token]);
  };

  const handleTokenResultClick = (token) => {
    onSelectAnswer(arrangedSequence.filter((item) => item !== token));
  };

  // MATCH_PAIRS select pairings
  const handlePairSelection = (leftItem, rightItem) => {
    const currentPairs = typeof selectedAnswer === "object" && selectedAnswer ? { ...selectedAnswer } : {};
    if (rightItem === "") {
      delete currentPairs[leftItem];
    } else {
      currentPairs[leftItem] = rightItem;
    }
    onSelectAnswer(currentPairs);
  };

  const leftItems = question.options?.left || [];
  const rightItems = question.options?.right || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
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
          <div className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
            {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
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

      {/* 1. MCQ_SINGLE */}
      {type === "MCQ_SINGLE" && (
        <OptionList
          options={question.options}
          selectedAnswer={selectedAnswer}
          onSelect={onSelectAnswer}
        />
      )}

      {/* 2. MCQ_MULTI */}
      {type === "MCQ_MULTI" && (
        <div className="space-y-4">
          {(question.options || []).map((option, index) => {
            const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(option);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleMultiToggle(option)}
                className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-800 bg-slate-900 hover:border-orange-500/40 hover:bg-slate-800"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${
                    isSelected ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base ${isSelected ? "font-medium text-white" : "text-slate-300"}`}>
                    {option}
                  </p>
                </div>
                {isSelected && <CheckCircle2 className="h-6 w-6 text-orange-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. ARRANGE_TOKENS */}
      {type === "ARRANGE_TOKENS" && (
        <div className="space-y-6">
          <p className="text-sm text-slate-400">Click the tokens in the correct order to build your sequence:</p>
          
          {/* Result Sequence Area */}
          <div className="min-h-16 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 flex flex-wrap gap-2.5 items-center">
            {arrangedSequence.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No tokens selected yet. Click options below to order.</span>
            ) : (
              arrangedSequence.map((token, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTokenResultClick(token)}
                  className="bg-orange-500 text-slate-950 px-4 py-2.5 rounded-lg text-sm font-extrabold flex items-center gap-1.5 shadow-lg shadow-orange-500/10 hover:scale-95 transition-transform"
                >
                  <span className="text-[10px] bg-slate-950/20 px-1 rounded">{index + 1}</span>
                  {token}
                </button>
              ))
            )}
          </div>

          {/* Shuffled Options Pool */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Options:</h4>
            <div className="flex flex-wrap gap-2.5">
              {tokenPool.map((token, index) => {
                const isSelected = arrangedSequence.includes(token);
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleTokenPoolClick(token)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition ${
                      isSelected
                        ? "border-slate-800 bg-slate-800/40 text-slate-600 cursor-not-allowed"
                        : "border-slate-800 bg-slate-900 text-slate-200 hover:border-orange-500/50 hover:bg-slate-850"
                    }`}
                  >
                    {token}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. MATCH_PAIRS */}
      {type === "MATCH_PAIRS" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-400">Match each item in the left column with its correct pair in the right column:</p>

          <div className="grid gap-4">
            {leftItems.map((leftItem, index) => {
              const pairedVal = selectedAnswer?.[leftItem] || "";
              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <span className="text-sm font-semibold text-white sm:w-1/3 truncate">{leftItem}</span>
                  
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <ArrowRight className="text-slate-600 hidden sm:block" size={16} />
                    <select
                      value={pairedVal}
                      onChange={(e) => handlePairSelection(leftItem, e.target.value)}
                      className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none transition focus:border-orange-500"
                    >
                      <option value="">Select Match Pair</option>
                      {rightItems.map((rightItem, optIdx) => (
                        <option key={optIdx} value={rightItem}>
                          {rightItem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SELF_ASSESSMENT */}
      {type === "SELF_ASSESSMENT" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400">Your Response Answer:</label>
          <textarea
            className="w-full h-44 rounded-xl border border-slate-750 bg-slate-950 p-4 text-white focus:border-orange-500 outline-none transition text-base leading-relaxed"
            placeholder="Type your comprehensive answer response details here..."
            value={selectedAnswer || ""}
            onChange={(e) => onSelectAnswer(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}