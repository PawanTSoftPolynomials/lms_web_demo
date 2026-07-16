"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Trash2, HelpCircle, CheckCircle } from "lucide-react";

export default function MatchPairsGrid({
  options = {},
  selectedPairs = {},
  onPairsChange,
}) {
  const columnA = options?.columnA || options?.left || [];
  const columnB = options?.columnB || options?.right || [];

  // Local state for tracking which Column A item is active/selected
  const [activeLeft, setActiveLeft] = useState(null);

  // Pair color styles generator to keep visual matching consistent
  const getPairStyle = (leftItem) => {
    const index = columnA.indexOf(leftItem);
    const styles = [
      { border: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-400", badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      { border: "border-purple-500/40 bg-purple-500/5", text: "text-purple-400", badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
      { border: "border-sky-500/40 bg-sky-500/5", text: "text-sky-400", badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
      { border: "border-amber-500/40 bg-amber-500/5", text: "text-amber-400", badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      { border: "border-pink-500/40 bg-pink-500/5", text: "text-pink-400", badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
    ];
    return styles[index % styles.length];
  };

  const handleLeftClick = (leftItem) => {
    // If already matched, click to unmatch/remove pairing
    if (selectedPairs[leftItem]) {
      const newPairs = { ...selectedPairs };
      delete newPairs[leftItem];
      onPairsChange(newPairs);
      if (activeLeft === leftItem) setActiveLeft(null);
    } else {
      // Toggle select
      setActiveLeft(activeLeft === leftItem ? null : leftItem);
    }
  };

  const handleRightClick = (rightItem) => {
    // Find if this rightItem is already matched to some leftItem
    const matchingLeftKey = Object.keys(selectedPairs).find(
      (k) => selectedPairs[k] === rightItem
    );

    if (activeLeft) {
      const newPairs = { ...selectedPairs };
      
      // If this right option was already paired with another left option, clear that old pair
      if (matchingLeftKey) {
        delete newPairs[matchingLeftKey];
      }

      newPairs[activeLeft] = rightItem;
      onPairsChange(newPairs);
      setActiveLeft(null);
    } else if (matchingLeftKey) {
      // If clicked a matched right item and no active left item, unmatch it
      const newPairs = { ...selectedPairs };
      delete newPairs[matchingLeftKey];
      onPairsChange(newPairs);
    }
  };

  const handleReset = () => {
    onPairsChange({});
    setActiveLeft(null);
  };

  return (
    <div className="space-y-6">
      {/* Description & Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-slate-450" />
          <p className="text-sm text-slate-400">
            Tap a card on the left, then tap its correct match on the right to pair them:
          </p>
        </div>
        {Object.keys(selectedPairs).length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/10 border border-red-900/30 text-xs font-semibold text-red-400 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Matches
          </button>
        )}
      </div>

      {/* Main Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column (Column A) */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Column A</h4>
          {columnA.map((leftItem) => {
            const matchedVal = selectedPairs[leftItem];
            const isMatched = !!matchedVal;
            const isActive = activeLeft === leftItem;
            const style = isMatched ? getPairStyle(leftItem) : null;

            return (
              <motion.button
                key={leftItem}
                type="button"
                onClick={() => handleLeftClick(leftItem)}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left cursor-pointer transition-all duration-300
                  ${
                    isActive
                      ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                      : isMatched
                      ? `${style.border} text-white`
                      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black
                    ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : isMatched
                        ? style.badgeBg
                        : "bg-slate-800 text-slate-400"
                    }
                  `}>
                    {columnA.indexOf(leftItem) + 1}
                  </div>
                  <span className="font-semibold truncate">{leftItem}</span>
                </div>

                {isMatched && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold uppercase shrink-0 ${style.badgeBg}`}>
                    Matched
                  </span>
                )}
                {isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold uppercase shrink-0 animate-pulse">
                    Select Match
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column (Column B) */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Column B</h4>
          {columnB.map((rightItem) => {
            // Find if this right option is matched to any left option
            const pairedLeftKey = Object.keys(selectedPairs).find(
              (k) => selectedPairs[k] === rightItem
            );
            const isMatched = !!pairedLeftKey;
            const style = isMatched ? getPairStyle(pairedLeftKey) : null;

            return (
              <motion.button
                key={rightItem}
                type="button"
                onClick={() => handleRightClick(rightItem)}
                whileHover={isMatched ? { scale: 1.01 } : { scale: 1.01, x: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left cursor-pointer transition-all duration-300
                  ${
                    isMatched
                      ? `${style.border} text-white`
                      : "border-slate-800 bg-slate-900/50 text-slate-350 hover:border-slate-700 hover:bg-slate-800/80"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black
                    ${isMatched ? style.badgeBg : "bg-slate-800 text-slate-500"}
                  `}>
                    {isMatched ? columnA.indexOf(pairedLeftKey) + 1 : "?"}
                  </div>
                  <span className="font-semibold truncate">{rightItem}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isMatched && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold uppercase ${style.badgeBg}`}>
                      Pair {columnA.indexOf(pairedLeftKey) + 1}
                    </span>
                  )}
                  {activeLeft && !isMatched && (
                    <span className="text-[9px] text-slate-500 font-bold group-hover:text-slate-400">
                      Link Item
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
