"use client";

import { Check, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MCQMultiOptionList({
  options = [],
  selectedAnswers = [],
  onSelect,
}) {
  const handleToggle = (option) => {
    let newAnswers;
    if (selectedAnswers.includes(option)) {
      newAnswers = selectedAnswers.filter((ans) => ans !== option);
    } else {
      newAnswers = [...selectedAnswers, option];
    }
    onSelect(newAnswers);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert / Instruction */}
      <div className="flex items-center gap-2 rounded-xl bg-orange-500/5 border border-orange-500/10 px-4 py-3 text-xs text-orange-400 font-semibold mb-4">
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <span>Multiple Choice: Select all options that apply to this question.</span>
      </div>

      {options.map((option, index) => {
        const isSelected = selectedAnswers.includes(option);

        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleToggle(option)}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              relative
              flex
              w-full
              items-start
              gap-4
              rounded-2xl
              border
              p-5
              text-left
              cursor-pointer
              transition-all
              duration-300
              ${
                isSelected
                  ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                  : "border-slate-800 bg-slate-900/60 hover:border-orange-500/30 hover:bg-slate-800/80 hover:shadow-lg"
              }
            `}
          >
            {/* Glow effect */}
            {isSelected && (
              <motion.div
                layoutId="activeMultiOptionGlow"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 -z-10 pointer-events-none"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Option Index Label (A, B, C, D) */}
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                font-extrabold
                text-sm
                transition-all
                duration-300
                ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }
              `}
            >
              {String.fromCharCode(65 + index)}
            </div>

            {/* Option Text */}
            <div className="flex-1 pt-1.5 min-w-0">
              <p
                className={`text-base leading-relaxed transition-colors duration-200 ${
                  isSelected
                    ? "font-semibold text-white"
                    : "text-slate-350"
                }`}
              >
                {option}
              </p>
            </div>

            {/* Checkbox indicator */}
            <div className="flex items-center self-center shrink-0">
              <AnimatePresence mode="wait">
                {isSelected ? (
                  <motion.div
                    key="checked"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  >
                    <Check className="h-4 w-4 stroke-[3.5]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="unchecked"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="h-6 w-6 rounded-lg border border-slate-750 bg-slate-950/40 hover:border-orange-500/50 transition-colors"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
