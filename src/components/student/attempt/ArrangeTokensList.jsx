"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const getTokenText = (opt) => {
  if (opt === null || opt === undefined) return "";
  if (typeof opt === "string") return opt;
  if (typeof opt === "object") return opt.optionText || opt.text || JSON.stringify(opt);
  return String(opt);
};

export default function ArrangeTokensList({
  options = [],
  selectedOrder = [],
  onOrderChange,
}) {
  const arrangedSequence = Array.isArray(selectedOrder) ? selectedOrder : [];

  const handlePoolClick = (token) => {
    const text = getTokenText(token);
    onOrderChange([...arrangedSequence, text]);
  };

  const handleSequenceClick = (token, idx) => {
    const newSeq = [...arrangedSequence];
    newSeq.splice(idx, 1);
    onOrderChange(newSeq);
  };

  const handleReset = () => {
    onOrderChange([]);
  };

  const handleAutoArrange = () => {
    onOrderChange(options.map(getTokenText));
  };

  return (
    <div className="space-y-6">
      {/* Help Instructions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tap the tokens in the correct logical sequence to build the statement:
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAutoArrange}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-slate-800 border border-transparent text-xs font-semibold text-foreground transition cursor-pointer"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/10 border border-red-900/30 text-xs font-semibold text-red-400 transition cursor-pointer"
            title="Clear Sequence"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* 1. Sequence Assembly Area (Dashed Container) */}
      <div className="relative min-h-[90px] rounded-2xl border-2 border-dashed border-border bg-background/40 p-5 flex flex-wrap gap-3 items-center transition-all duration-300 hover:border-transparent/60">
        <AnimatePresence>
          {arrangedSequence.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-sm text-slate-400 italic">Tap the options below to arrange them here.</span>
            </motion.div>
          ) : (
            arrangedSequence.map((token, index) => {
              const tokenText = getTokenText(token);
              return (
                <motion.button
                  layout
                  key={`${tokenText}_seq_${index}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  type="button"
                  onClick={() => handleSequenceClick(tokenText, index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-orange-500/15 hover:shadow-orange-500/30 transition-shadow cursor-pointer select-none"
                >
                  <span className="text-[10px] bg-background/20 px-2 py-0.5 rounded-md text-slate-950/80 font-black">
                    {index + 1}
                  </span>
                  <span>{tokenText}</span>
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* 2. Available Options Pool */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Options:</h4>
          <span className="h-1 flex-1 bg-muted/40 rounded-full" />
        </div>

        <div className="min-h-[60px] rounded-2xl border border-border/80 bg-background/30 p-4 flex flex-wrap gap-2.5">
          <AnimatePresence>
            {options.map((token, index) => {
              const tokenText = getTokenText(token);
              const selectionCount = arrangedSequence.filter(t => t === tokenText).length;
              const originalCount = options.map(getTokenText).filter(t => t === tokenText).length;
              const isSelected = selectionCount >= originalCount;

              return (
                <motion.button
                  layout
                  key={`${tokenText}_pool_${index}`}
                  disabled={isSelected}
                  type="button"
                  onClick={() => handlePoolClick(tokenText)}
                  whileHover={isSelected ? {} : { scale: 1.05, y: -1 }}
                  whileTap={isSelected ? {} : { scale: 0.95 }}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer select-none
                    ${
                      isSelected
                        ? "border-border/50 bg-slate-800/40 text-slate-600 cursor-not-allowed opacity-30"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-slate-800 hover:text-foreground hover:shadow-md"
                    }
                  `}
                >
                  {tokenText}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
