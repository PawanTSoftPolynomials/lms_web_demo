"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import MarkdownField from "@/components/instructor/composer/MarkdownField";

const ANSWER_TYPES = [
  { value: "chooseOne", label: "Choose One" },
  { value: "chooseMultiple", label: "Choose Multiple" },
  { value: "fill-in-the-blanks", label: "Fill in the Blanks" },
  { value: "arrange-in-order", label: "Arrange in Order" },
  { value: "connect-pairs", label: "Connect Pairs" },
];

function OptionsEditor({ block, onChange, multiple }) {
  const options = block.options || [];
  const correctAnswer = block.correctAnswer || [];

  const updateOption = (i, text) => {
    onChange({ options: options.map((o, idx) => (idx === i ? text : o)) });
  };

  const removeOption = (i) => {
    const nextOptions = options.filter((_, idx) => idx !== i);
    const nextCorrect = correctAnswer
      .filter((ci) => ci !== i)
      .map((ci) => (ci > i ? ci - 1 : ci));
    onChange({ options: nextOptions, correctAnswer: nextCorrect });
  };

  const addOption = () => {
    onChange({ options: [...options, `Option ${options.length + 1}`] });
  };

  const toggleCorrect = (i) => {
    if (multiple) {
      const next = correctAnswer.includes(i)
        ? correctAnswer.filter((ci) => ci !== i)
        : [...correctAnswer, i].sort((a, b) => a - b);
      onChange({ correctAnswer: next });
    } else {
      onChange({ correctAnswer: [i] });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">
        Options — mark the correct {multiple ? "answers" : "answer"}
      </label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type={multiple ? "checkbox" : "radio"}
            checked={correctAnswer.includes(i)}
            onChange={() => toggleCorrect(i)}
            className="shrink-0 accent-orange-500"
          />
          <Input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
      >
        <Plus size={12} /> Add Option
      </button>
    </div>
  );
}

function ArrangeOrderEditor({ block, onChange }) {
  const options = block.options || [];

  const updateOption = (i, text) => {
    onChange({ options: options.map((o, idx) => (idx === i ? text : o)) });
  };

  const removeOption = (i) => {
    onChange({ options: options.filter((_, idx) => idx !== i) });
  };

  const addOption = () => {
    onChange({ options: [...options, `Step ${options.length + 1}`] });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">
        Items, listed in the CORRECT order (students see them shuffled)
      </label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-center text-xs text-slate-500 shrink-0">{i + 1}</span>
          <Input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
      >
        <Plus size={12} /> Add Item
      </button>
    </div>
  );
}

function ConnectPairsEditor({ block, onChange }) {
  const pairs = block.pairs || [];

  const syncDerived = (nextPairs) => {
    onChange({
      pairs: nextPairs,
      options: [...nextPairs.map((p) => p.term), ...nextPairs.map((p) => p.definition)],
      correctAnswer: nextPairs.map((_, i) => [i, nextPairs.length + i]),
    });
  };

  const updatePair = (i, patch) => {
    syncDerived(pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  const removePair = (i) => {
    syncDerived(pairs.filter((_, idx) => idx !== i));
  };

  const addPair = () => {
    syncDerived([...pairs, { term: "", definition: "" }]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">Term / Definition pairs</label>
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={pair.term}
            onChange={(e) => updatePair(i, { term: e.target.value })}
            placeholder="Term"
            className="flex-1"
          />
          <Input
            value={pair.definition}
            onChange={(e) => updatePair(i, { definition: e.target.value })}
            placeholder="Definition"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removePair(i)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
      >
        <Plus size={12} /> Add Pair
      </button>
    </div>
  );
}

function FillBlanksEditor({ block, onChange }) {
  const answers = block.correctAnswer || [];

  const updateAnswer = (i, text) => {
    onChange({ correctAnswer: answers.map((a, idx) => (idx === i ? text : a)) });
  };

  const removeAnswer = (i) => {
    onChange({ correctAnswer: answers.filter((_, idx) => idx !== i) });
  };

  const addAnswer = () => {
    onChange({ correctAnswer: [...answers, ""] });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">
        Blank answers, in the order they appear in the question (only a single blank creates
        a scored quiz question — more than one is preview-only)
      </label>
      {answers.map((ans, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-16 text-xs text-slate-500 shrink-0">Blank {i + 1}</span>
          <Input
            value={ans}
            onChange={(e) => updateAnswer(i, e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeAnswer(i)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addAnswer}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
      >
        <Plus size={12} /> Add Blank
      </button>
    </div>
  );
}

export default function QuizBlockEdit({ block, onChange }) {
  const handleAnswerTypeChange = (answerType) => {
    // Reset the answer-shape fields when switching type, so stale data
    // from a previous shape (e.g. connect-pairs' `pairs`) can't leak in.
    onChange({
      answerType,
      options: [],
      correctAnswer: [],
      pairs: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Answer Type</label>
          <select
            value={block.answerType}
            onChange={(e) => handleAnswerTypeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-sm outline-none focus:border-orange-500"
          >
            {ANSWER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Points"
          type="number"
          min={1}
          value={block.points ?? 10}
          onChange={(e) => onChange({ points: Number(e.target.value) })}
        />
        <Input
          label="Allowed time (optional)"
          value={block.allowedTime || ""}
          onChange={(e) => onChange({ allowedTime: e.target.value })}
          placeholder="e.g. 5m"
        />
      </div>

      <MarkdownField
        label="Question"
        value={block.question}
        onChange={(question) => onChange({ question })}
        rows={3}
      />

      {block.answerType === "chooseOne" && (
        <OptionsEditor block={block} onChange={onChange} multiple={false} />
      )}
      {block.answerType === "chooseMultiple" && (
        <OptionsEditor block={block} onChange={onChange} multiple />
      )}
      {block.answerType === "arrange-in-order" && (
        <ArrangeOrderEditor block={block} onChange={onChange} />
      )}
      {block.answerType === "connect-pairs" && (
        <ConnectPairsEditor block={block} onChange={onChange} />
      )}
      {block.answerType === "fill-in-the-blanks" && (
        <FillBlanksEditor block={block} onChange={onChange} />
      )}

      <MarkdownField
        label="Explanation (shown after checking the answer)"
        value={block.explanation}
        onChange={(explanation) => onChange({ explanation })}
        rows={3}
      />
    </div>
  );
}
