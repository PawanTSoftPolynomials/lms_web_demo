"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OptionList({
  options = [],
  selectedAnswer,
  onSelect,
}) {
  return (
    <div className="space-y-4">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;

        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => onSelect(option)}
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
            {/* Background selection glow gradient */}
            {isSelected && (
              <motion.div
                layoutId="activeOptionGlow"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 -z-10 pointer-events-none"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Option Label (A, B, C, D) */}
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

            {/* Selected Indicator Checkmark */}
            <div className="flex items-center self-center shrink-0">
              <AnimatePresence>
                {isSelected ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -45 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-orange-500 fill-orange-500/10" />
                  </motion.div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-slate-700 bg-slate-950/20 hover:border-orange-500/40 transition-colors" />
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}