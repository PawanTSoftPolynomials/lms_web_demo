"use client";

import { useState } from "react";

export default function QuizForm({
  initialData = {
    title: "",
    description: "",
    passingScore: 0,
    timeLimit: 0,
  },
  onSubmit,
  submitText = "Save Quiz",
  loading = false,
}) {
  const [formData, setFormData] =
    useState(initialData);

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFormData({
      ...formData,
      [name]:
        name === "passingScore" ||
        name === "timeLimit"
          ? Number(value)
          : value,
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
      {/* Quiz Title */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Quiz Title
        </label>

        <p className="text-sm text-slate-400">
          Enter a meaningful quiz name such as
          "Java Basics Quiz" or "OOP Concepts Test".
        </p>

        <input
          type="text"
          name="title"
          placeholder="Example: Java Basics Quiz"
          value={formData.title}
          onChange={handleChange}
          required
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-4
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Description
        </label>

        <p className="text-sm text-slate-400">
          Explain what topics this quiz covers.
        </p>

        <textarea
          name="description"
          rows="4"
          placeholder="This quiz covers Java variables, data types, and operators."
          value={formData.description}
          onChange={handleChange}
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-4
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Passing Score */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Passing Score (%)
        </label>

        <p className="text-sm text-slate-400">
          Minimum percentage required to pass the quiz.
          Example: 40%, 50%, or 70%.
        </p>

        <input
          type="number"
          name="passingScore"
          min="0"
          max="100"
          placeholder="Example: 50"
          value={formData.passingScore}
          onChange={handleChange}
          required
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-4
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Time Limit */}
      <div className="space-y-2">
        <label className="text-white font-medium">
          Time Limit (Minutes)
        </label>

        <p className="text-sm text-slate-400">
          Set the duration of the quiz.
          Example: 15, 30, or 60 minutes.
        </p>

        <input
          type="number"
          name="timeLimit"
          min="0"
          placeholder="Example: 30"
          value={formData.timeLimit}
          onChange={handleChange}
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-4
            text-white
            outline-none
            focus:border-orange-500
          "
        />
      </div>

      {/* Information Box */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
        <h3 className="text-orange-400 font-medium mb-2">
          Quiz Guidelines
        </h3>

        <ul className="text-sm text-slate-300 space-y-1 list-disc ml-5">
          <li>Passing score should be between 0 and 100.</li>
          <li>Time limit is measured in minutes.</li>
          <li>Keep quiz titles short and descriptive.</li>
          <li>Add questions after creating the quiz.</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          bg-orange-600
          hover:bg-orange-700
          px-8
          py-4
          rounded-xl
          text-white
          font-semibold
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