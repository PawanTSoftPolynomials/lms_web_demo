"use client";

import { useState } from "react";

export default function QuestionForm({
  initialData = {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
  },
  onSubmit,
  submitText = "Save Question",
  loading = false,
}) {
  const [formData, setFormData] =
    useState(initialData);

  const handleOptionChange = (
    index,
    value
  ) => {
    const updated = [...formData.options];

    updated[index] = value;

    setFormData({
      ...formData,
      options: updated,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Question */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Question
        </label>

        <p className="text-sm text-slate-400">
          Enter the question that students will answer.
        </p>

        <textarea
          rows={3}
          placeholder="Example: What is the full form of OOP?"
          value={formData.question}
          onChange={(e) =>
            setFormData({
              ...formData,
              question: e.target.value,
            })
          }
          required
          className="
            w-full
            p-4
            rounded-xl
            bg-slate-800
            border
            border-slate-700
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="text-white font-medium">
          Answer Options
        </label>

        <p className="text-sm text-slate-400">
          Enter four possible answers.
        </p>

        {formData.options.map(
          (option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                handleOptionChange(
                  index,
                  e.target.value
                )
              }
              required
              className="
                w-full
                p-4
                rounded-xl
                bg-slate-800
                border
                border-slate-700
                text-white
                outline-none
                focus:border-orange-500
              "
            />
          )
        )}
      </div>

      {/* Correct Answer */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Correct Answer
        </label>

        <p className="text-sm text-slate-400">
          Enter exactly one of the options above.
        </p>

        <input
          type="text"
          placeholder="Example: Object Oriented Programming"
          value={formData.correctAnswer}
          onChange={(e) =>
            setFormData({
              ...formData,
              correctAnswer:
                e.target.value,
            })
          }
          required
          className="
            w-full
            p-4
            rounded-xl
            bg-slate-800
            border
            border-slate-700
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Marks */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Marks
        </label>

        <p className="text-sm text-slate-400">
          Assign marks for this question.
        </p>

        <input
          type="number"
          min="1"
          value={formData.marks}
          onChange={(e) =>
            setFormData({
              ...formData,
              marks: Number(
                e.target.value
              ),
            })
          }
          required
          className="
            w-full
            p-4
            rounded-xl
            bg-slate-800
            border
            border-slate-700
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Guidelines */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
        <h3 className="text-orange-400 font-medium mb-2">
          Question Guidelines
        </h3>

        <ul className="text-sm text-slate-300 space-y-1 list-disc ml-5">
          <li>Provide four answer options.</li>
          <li>The correct answer must match one option exactly.</li>
          <li>Keep questions clear and concise.</li>
          <li>Assign marks according to difficulty.</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          bg-orange-600
          hover:bg-orange-700
          px-8
          py-3
          rounded-xl
          text-white
          font-medium
          transition
        "
      >
        {loading
          ? "Saving..."
          : submitText}
      </button>
    </form>
  );
}