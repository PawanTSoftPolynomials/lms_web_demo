"use client";

import { motion } from "framer-motion";

const getOptionText = (opt) => {
  if (opt === null || opt === undefined) return "";
  if (typeof opt === "string") return opt;
  if (typeof opt === "object") return opt.optionText || opt.text || JSON.stringify(opt);
  return String(opt);
};

export default function OptionList({
  options = [],
  selectedAnswer,
  onSelect,
}) {
  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const optionText = getOptionText(option);
        const isSelected = selectedAnswer === optionText || selectedAnswer === option;

        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => onSelect(optionText)}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              relative
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              p-3.5
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

            {/* Radio Indicator */}
            <div
              className={`
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-full
                border-2
                transition-all
                duration-300
                ${
                  isSelected
                    ? "border-orange-500 bg-orange-500"
                    : "border-slate-600"
                }
              `}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>

            {/* Option Label (A, B, C, D) */}
            <div
              className={`
                flex
                h-8
                w-8
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
                {optionText}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}