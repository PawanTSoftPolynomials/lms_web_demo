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
    const updated =
      [...formData.options];

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
      className="space-y-5"
    >
      <textarea
        placeholder="Question"
        value={formData.question}
        onChange={(e) =>
          setFormData({
            ...formData,
            question:
              e.target.value,
          })
        }
        rows={3}
        className="
          w-full
          p-4
          rounded-xl
          bg-slate-800
          border
          border-slate-700
          text-white
        "
      />

      {formData.options.map(
        (option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${
              index + 1
            }`}
            value={option}
            onChange={(e) =>
              handleOptionChange(
                index,
                e.target.value
              )
            }
            className="
              w-full
              p-4
              rounded-xl
              bg-slate-800
              border
              border-slate-700
              text-white
            "
          />
        )
      )}

      <input
        type="text"
        placeholder="Correct Answer"
        value={
          formData.correctAnswer
        }
        onChange={(e) =>
          setFormData({
            ...formData,
            correctAnswer:
              e.target.value,
          })
        }
        className="
          w-full
          p-4
          rounded-xl
          bg-slate-800
          border
          border-slate-700
          text-white
        "
      />

      <input
        type="number"
        value={formData.marks}
        onChange={(e) =>
          setFormData({
            ...formData,
            marks: Number(
              e.target.value
            ),
          })
        }
        className="
          w-full
          p-4
          rounded-xl
          bg-slate-800
          border
          border-slate-700
          text-white
        "
      />

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
        "
      >
        {loading
          ? "Saving..."
          : submitText}
      </button>
    </form>
  );
}