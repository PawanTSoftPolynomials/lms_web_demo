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
      <input
        type="text"
        name="title"
        placeholder="Quiz Title"
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

      <textarea
        name="description"
        rows="4"
        placeholder="Description"
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

      <input
        type="number"
        name="passingScore"
        placeholder="Passing Score"
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

      <input
        type="number"
        name="timeLimit"
        placeholder="Time Limit (minutes)"
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