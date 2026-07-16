"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
  type: "MCQ_SINGLE",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
  concept: "",
};

export default function QuestionForm({
                                       mode = "create",
                                       initialValues = null,
                                       loading = false,
                                       onSubmit,
                                     }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [pairs, setPairs] = useState([{ left: "", right: "" }, { left: "", right: "" }]);
  const [tokens, setTokens] = useState(["", "", ""]);

  useEffect(() => {
    if (initialValues) {
      const type = initialValues.type ?? "MCQ_SINGLE";
      
      setFormData({
        type,
        question: initialValues.question ?? "",
        options: initialValues.options ?? ["", "", "", ""],
        correctAnswer: initialValues.correctAnswer ?? "",
        marks: initialValues.marks ?? 1,
        concept: initialValues.concept ?? "",
      });

      if (type === "MATCH_PAIRS" && initialValues.correctAnswer) {
        const parsedPairs = Object.entries(initialValues.correctAnswer).map(([left, right]) => ({
          left,
          right,
        }));
        setPairs(parsedPairs.length ? parsedPairs : [{ left: "", right: "" }, { left: "", right: "" }]);
      } else if (type === "ARRANGE_TOKENS" && Array.isArray(initialValues.options)) {
        setTokens(initialValues.options);
      }
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "marks" ? Number(value) : value,
    }));
  };

  const handleTypeChange = (newType) => {
    let defaultOptions = ["", "", "", ""];
    let defaultCorrect = "";

    if (newType === "MATCH_PAIRS") {
      defaultOptions = { left: ["", ""], right: ["", ""] };
      defaultCorrect = {};
      setPairs([{ left: "", right: "" }, { left: "", right: "" }]);
    } else if (newType === "ARRANGE_TOKENS") {
      defaultOptions = ["", "", ""];
      defaultCorrect = [];
      setTokens(["", "", ""]);
    } else if (newType === "MCQ_MULTI") {
      defaultOptions = ["", "", "", ""];
      defaultCorrect = [];
    } else if (newType === "SELF_ASSESSMENT") {
      defaultOptions = [];
      defaultCorrect = "";
    }

    setFormData((prev) => ({
      ...prev,
      type: newType,
      options: defaultOptions,
      correctAnswer: defaultCorrect,
    }));
  };

  // MCQ_SINGLE option change
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  // MCQ_MULTI toggles
  const handleMultiCorrectToggle = (optionText) => {
    if (!optionText) return;
    const currentCorrect = Array.isArray(formData.correctAnswer) ? formData.correctAnswer : [];
    const updated = currentCorrect.includes(optionText)
      ? currentCorrect.filter((item) => item !== optionText)
      : [...currentCorrect, optionText];
    
    setFormData((prev) => ({
      ...prev,
      correctAnswer: updated,
    }));
  };

  // ARRANGE_TOKENS handling
  const handleTokenChange = (index, value) => {
    const updatedTokens = [...tokens];
    updatedTokens[index] = value;
    setTokens(updatedTokens);
  };

  const addToken = () => {
    setTokens([...tokens, ""]);
  };

  const removeToken = (index) => {
    setTokens(tokens.filter((_, i) => i !== index));
  };

  // MATCH_PAIRS handling
  const handlePairChange = (index, field, value) => {
    const updatedPairs = [...pairs];
    updatedPairs[index][field] = value;
    setPairs(updatedPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { left: "", right: "" }]);
  };

  const removePair = (index) => {
    setPairs(pairs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = { ...formData };

    if (formData.type === "MATCH_PAIRS") {
      const validPairs = pairs.filter((p) => p.left && p.right);
      submissionData.options = {
        left: validPairs.map((p) => p.left),
        right: validPairs.map((p) => p.right),
      };
      submissionData.correctAnswer = validPairs.reduce(
        (acc, p) => ({ ...acc, [p.left]: p.right }),
        {}
      );
    } else if (formData.type === "ARRANGE_TOKENS") {
      const validTokens = tokens.filter((t) => t.trim() !== "");
      submissionData.options = validTokens;
      submissionData.correctAnswer = validTokens;
    } else if (formData.type === "SELF_ASSESSMENT") {
      submissionData.options = [];
    }

    onSubmit?.(submissionData);
  };

  return (
    <Card className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {mode === "create" ? "Create Question" : "Edit Question"}
        </h1>
        <p className="mt-2 text-slate-400">
          Create structured questions using advanced quiz modes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Type Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Question Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          >
            <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
            <option value="MCQ_MULTI">Multiple Choice (Checkboxes)</option>
            <option value="ARRANGE_TOKENS">Arrange Tokens (Sequence)</option>
            <option value="MATCH_PAIRS">Match Pairs (Columns Matching)</option>
            <option value="SELF_ASSESSMENT">Self Assessment (Text Area)</option>
          </select>
        </div>

        {/* Question Text */}
        <Input
          label="Question / Instruction"
          name="question"
          value={formData.question}
          onChange={handleChange}
          placeholder={
            formData.type === "MATCH_PAIRS"
              ? "Match the terms to their descriptions."
              : "What is the output of the code snippet?"
          }
          required
        />

        {/* Concept Tag */}
        <Input
          label="Concept / Topic Tag"
          name="concept"
          value={formData.concept}
          onChange={handleChange}
          placeholder="e.g. Java Basics, Biology, Math"
        />

        {/* MCQ_SINGLE Options View */}
        {formData.type === "MCQ_SINGLE" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Answer Options</h2>
            {formData.options.map((option, index) => (
              <Input
                key={index}
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Enter option ${index + 1}`}
                required
              />
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Correct Answer Option
              </label>
              <select
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-orange-500"
              >
                <option value="">Select Correct Option</option>
                {formData.options.map((option, index) => (
                  <option key={index} value={option} disabled={!option}>
                    Option {index + 1} {option ? ` - ${option}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* MCQ_MULTI Options View */}
        {formData.type === "MCQ_MULTI" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Answer Options</h2>
            {formData.options.map((option, index) => (
              <Input
                key={index}
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Enter option ${index + 1}`}
                required
              />
            ))}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Select Correct Options (Check all that apply)
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                {formData.options.map((option, index) => {
                  const isChecked = Array.isArray(formData.correctAnswer) && formData.correctAnswer.includes(option);
                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        isChecked
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!option}
                        onChange={() => handleMultiCorrectToggle(option)}
                        className="rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-200">
                        Option {index + 1} {option ? `: ${option}` : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ARRANGE_TOKENS Options View */}
        {formData.type === "ARRANGE_TOKENS" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Arrange Tokens (In Correct Order)</h2>
              <Button type="button" onClick={addToken} className="px-3 py-1.5 text-xs flex items-center gap-1">
                <Plus size={14} /> Add Token
              </Button>
            </div>

            <div className="space-y-3">
              {tokens.map((token, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm font-bold w-6">{index + 1}.</span>
                  <div className="flex-1">
                    <Input
                      value={token}
                      onChange={(e) => handleTokenChange(index, e.target.value)}
                      placeholder="Enter token text"
                      required
                    />
                  </div>
                  {tokens.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeToken(index)}
                      className="text-slate-500 hover:text-red-400 p-2 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MATCH_PAIRS Options View */}
        {formData.type === "MATCH_PAIRS" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Match Pairs (Left to Right pairings)</h2>
              <Button type="button" onClick={addPair} className="px-3 py-1.5 text-xs flex items-center gap-1">
                <Plus size={14} /> Add Match Pair
              </Button>
            </div>

            <div className="space-y-4">
              {pairs.map((pair, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-sm font-bold w-6">{index + 1}.</span>
                  <div className="flex-1 w-full">
                    <Input
                      value={pair.left}
                      onChange={(e) => handlePairChange(index, "left", e.target.value)}
                      placeholder="Left Item (e.g. Cat)"
                      required
                    />
                  </div>
                  <span className="text-slate-500 text-xs font-bold font-mono">⟷</span>
                  <div className="flex-1 w-full">
                    <Input
                      value={pair.right}
                      onChange={(e) => handlePairChange(index, "right", e.target.value)}
                      placeholder="Right Item (e.g. Mammal)"
                      required
                    />
                  </div>
                  {pairs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePair(index)}
                      className="text-slate-500 hover:text-red-400 p-2 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELF_ASSESSMENT Options View */}
        {formData.type === "SELF_ASSESSMENT" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Self Assessment Rubric</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Ideal Answer / Evaluation Criteria
              </label>
              <textarea
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                placeholder="Describe key concepts, keywords, or points the student should include in their response to pass."
                required
                className="w-full h-36 rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition focus:border-orange-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Marks Input */}
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Question Marks"
            type="number"
            name="marks"
            min={1}
            value={formData.marks}
            onChange={handleChange}
            required
          />
        </div>

        {/* Guidelines Footer */}
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
          <h3 className="font-semibold text-orange-400">Guidelines</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Ensure the instruction fits the selected question format.</li>
            <li>Double-check matches and sequencing correct order before submitting.</li>
            <li>Marks must be a positive integer value.</li>
          </ul>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Question"
              : "Update Question"}
          </Button>
        </div>
      </form>
    </Card>
  );
}