"use client";

import { CheckCircle } from "lucide-react";

export default function MatchPairsGrid({
                                           options = {},
                                           selectedPairs = {},
                                           onPairsChange,
                                       }) {
    const columnA = options.columnA || [];
    const columnB = options.columnB || [];

    const handleMatch = (itemA, itemB) => {
        const newPairs = {
            ...selectedPairs,
            [itemA]: itemB === "" ? undefined : itemB,
        };
        // Clean undefined fields
        Object.keys(newPairs).forEach(key => {
            if (newPairs[key] === undefined) delete newPairs[key];
        });
        onPairsChange(newPairs);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-2">
                Connect each item in Column A with its correct pair in Column B:
            </p>
            <div className="border border-slate-800 bg-slate-950 p-4 rounded-xl space-y-4">
                {columnA.map((itemA, index) => {
                    const currentMatch = selectedPairs[itemA] || "";
                    const isMatched = !!currentMatch;

                    return (
                        <div
                            key={itemA}
                            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border transition ${
                                isMatched
                                    ? "border-orange-500/30 bg-orange-500/5 text-white"
                                    : "border-slate-800 bg-slate-900 text-slate-300"
                            }`}
                        >
                            {/* Column A Item */}
                            <div className="flex items-center gap-3 md:w-1/2">
                                <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-xs font-semibold text-orange-400">
                                    {index + 1}
                                </div>
                                <span className="font-semibold text-white">{itemA}</span>
                            </div>

                            {/* Matching Connection Selector */}
                            <div className="flex items-center gap-3 md:w-1/2 justify-end">
                                <select
                                    value={currentMatch}
                                    onChange={(e) => handleMatch(itemA, e.target.value)}
                                    className="w-full md:w-64 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white hover:bg-slate-750 focus:border-orange-500 focus:outline-none transition cursor-pointer"
                                >
                                    <option value="">-- Choose Match --</option>
                                    {columnB.map((itemB) => (
                                        <option key={itemB} value={itemB}>
                                            {itemB}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center justify-center w-6">
                                    {isMatched ? (
                                        <CheckCircle className="h-5 w-5 text-orange-500" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border border-slate-700 bg-slate-800" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
