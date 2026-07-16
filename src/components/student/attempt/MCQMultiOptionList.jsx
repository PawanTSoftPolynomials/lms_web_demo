"use client";

import { CheckSquare, Square } from "lucide-react";

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
            <p className="text-sm text-slate-400 mb-2">Select all options that apply (multiple choice):</p>
            {options.map((option, index) => {
                const isSelected = selectedAnswers.includes(option);

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleToggle(option)}
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

                        <div className="flex-1 mt-2">
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

                        <div className="mt-2 text-slate-400">
                            {isSelected ? (
                                <CheckSquare className="h-6 w-6 text-orange-500" />
                            ) : (
                                <Square className="h-6 w-6 text-slate-600 hover:text-slate-400" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
