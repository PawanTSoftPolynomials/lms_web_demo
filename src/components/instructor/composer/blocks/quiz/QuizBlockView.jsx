"use client";

import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Info } from "lucide-react";
import { isBackendGradable } from "@/components/instructor/composer/mappers/quizMapper";

function markdown(text) {
  return text ? DOMPurify.sanitize(marked.parse(text)) : "";
}

function ChooseOneOrMultiple({ block, multiple }) {
  const options = block.options || [];
  const correctAnswer = block.correctAnswer || [];
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);

  const toggle = (i) => {
    if (checked) return;
    if (multiple) {
      setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
    } else {
      setSelected([i]);
    }
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2 list-none">
        {options.map((opt, i) => {
          const isSelected = selected.includes(i);
          const isCorrect = correctAnswer.includes(i);
          let stateClass = "border-slate-700 bg-slate-900/40";
          if (checked) {
            if (isCorrect) stateClass = "border-emerald-600 bg-emerald-950/30";
            else if (isSelected) stateClass = "border-red-600 bg-red-950/30";
          } else if (isSelected) {
            stateClass = "border-orange-500 bg-orange-950/20";
          }
          return (
            <li
              key={i}
              onClick={() => toggle(i)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition ${stateClass}`}
            >
              <span className="w-7 h-7 rounded-full border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm text-slate-200">{opt}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end gap-2">
        {checked ? (
          <button
            type="button"
            onClick={() => {
              setChecked(false);
              setSelected([]);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Retry
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={selected.length === 0}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}

function FillBlanks({ block }) {
  const correctAnswer = block.correctAnswer || [];
  const [values, setValues] = useState(correctAnswer.map(() => ""));
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-3">
      {correctAnswer.map((correct, i) => {
        const isCorrect = values[i]?.trim().toLowerCase() === String(correct).trim().toLowerCase();
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Blank {i + 1}:</span>
            <input
              value={values[i] || ""}
              disabled={checked}
              onChange={(e) =>
                setValues((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
              }
              className={`px-2 py-1 rounded-md bg-slate-900 border font-mono text-sm outline-none ${
                checked
                  ? isCorrect
                    ? "border-emerald-600 text-emerald-400"
                    : "border-red-600 text-red-400"
                  : "border-slate-700 focus:border-orange-500"
              }`}
            />
          </div>
        );
      })}
      <div className="flex justify-end gap-2">
        {checked ? (
          <button
            type="button"
            onClick={() => {
              setChecked(false);
              setValues(correctAnswer.map(() => ""));
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Retry
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}

function ArrangeInOrder({ block }) {
  const options = block.options || [];
  const [order, setOrder] = useState(options.map((_, i) => i));
  const [checked, setChecked] = useState(false);
  const dragIndex = { current: null };

  return (
    <div className="space-y-3">
      <ul className="space-y-2 list-none">
        {order.map((optIdx, position) => {
          const isCorrect = checked && position === optIdx;
          return (
            <li
              key={optIdx}
              draggable={!checked}
              onDragStart={() => {
                dragIndex.current = position;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current === null) return;
                setOrder((prev) => {
                  const next = [...prev];
                  const [moved] = next.splice(dragIndex.current, 1);
                  next.splice(position, 0, moved);
                  return next;
                });
              }}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition ${
                checked
                  ? isCorrect
                    ? "border-emerald-600 bg-emerald-950/30"
                    : "border-red-600 bg-red-950/30"
                  : "border-slate-700 bg-slate-900/40 cursor-grab"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                  {position + 1}
                </span>
                <span className="text-sm text-slate-200">{options[optIdx]}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end gap-2">
        {checked ? (
          <button
            type="button"
            onClick={() => setChecked(false)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Retry
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectPairs({ block }) {
  const pairs = block.pairs || [];
  const [matched, setMatched] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const pickLeft = (i) => setSelectedLeft(i);
  const pickRight = (i) => {
    if (selectedLeft === null) return;
    setMatched((prev) => [...prev, [selectedLeft, i]]);
    setSelectedLeft(null);
  };

  const isLeftMatched = (i) => matched.some(([l]) => l === i);
  const isRightMatched = (i) => matched.some(([, r]) => r === i);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h5 className="text-xs uppercase tracking-wide text-slate-500">Terms</h5>
          {pairs.map((p, i) => (
            <div
              key={i}
              onClick={() => !isLeftMatched(i) && pickLeft(i)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                isLeftMatched(i)
                  ? "border-emerald-700 bg-emerald-950/20 opacity-50 cursor-default"
                  : selectedLeft === i
                    ? "border-orange-500 bg-orange-950/20 cursor-pointer"
                    : "border-slate-700 bg-slate-900/40 cursor-pointer"
              }`}
            >
              {p.term}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h5 className="text-xs uppercase tracking-wide text-slate-500">Definitions</h5>
          {pairs.map((p, i) => (
            <div
              key={i}
              onClick={() => !isRightMatched(i) && pickRight(i)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                isRightMatched(i)
                  ? "border-emerald-700 bg-emerald-950/20 opacity-50 cursor-default"
                  : "border-slate-700 bg-slate-900/40 cursor-pointer"
              }`}
            >
              {p.definition}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Matches: {matched.length} of {pairs.length}
        </span>
        <button
          type="button"
          onClick={() => setMatched([])}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Reset Pairs
        </button>
      </div>
    </div>
  );
}

export default function QuizBlockView({ block }) {
  const gradable = isBackendGradable(block);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Quiz — {block.points ?? 10} pts
        </span>
        {!gradable && (
          <span
            title="Not sent to the gradebook — this answer type (or multi-blank fill-in-the-blanks) has no backend-gradable equivalent yet. It still previews and edits fully here."
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/60 cursor-help"
          >
            <Info size={10} /> Preview only
          </span>
        )}
      </div>

      <div
        className="prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: markdown(block.question) || "<p>Question…</p>" }}
      />

      {block.answerType === "chooseOne" && <ChooseOneOrMultiple block={block} multiple={false} />}
      {block.answerType === "chooseMultiple" && <ChooseOneOrMultiple block={block} multiple />}
      {block.answerType === "fill-in-the-blanks" && <FillBlanks block={block} />}
      {block.answerType === "arrange-in-order" && <ArrangeInOrder block={block} />}
      {block.answerType === "connect-pairs" && <ConnectPairs block={block} />}

      {block.explanation && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Explanation</p>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: markdown(block.explanation) }}
          />
        </div>
      )}
    </div>
  );
}
