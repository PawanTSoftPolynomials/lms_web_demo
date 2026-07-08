"use client";

import { CheckCircle2 } from "lucide-react";

export default function OptionList({
                                       options = [],
                                       selectedAnswer,
                                       onSelect,
                                   }) {
    return (
        <div className="space-y-4">
            {options.map((option, index) => {
                const isSelected =
                    selectedAnswer === option;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onSelect(option)}
                        className={`
              flex
              w-full
              items-start
              gap-4
              rounded-xl
              border
              p-5
              text-left
              transition-all
              duration-200
              ${
                            isSelected
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-slate-800 bg-slate-900 hover:border-orange-500/40 hover:bg-slate-800"
                        }
            `}
                    >
                        {/* Option Label */}
                        <div
                            className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                font-semibold
                ${
                                isSelected
                                    ? "bg-orange-500 text-white"
                                    : "bg-slate-800 text-slate-400"
                            }
              `}
                        >
                            {String.fromCharCode(65 + index)}
                        </div>

                        {/* Option Text */}
                        <div className="flex-1">
                            <p
                                className={`text-base ${
                                    isSelected
                                        ? "font-medium text-white"
                                        : "text-slate-300"
                                }`}
                            >
                                {option}
                            </p>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                            <CheckCircle2 className="h-6 w-6 text-orange-500" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}