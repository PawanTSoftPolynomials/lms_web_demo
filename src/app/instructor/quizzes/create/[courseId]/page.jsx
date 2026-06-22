"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createQuiz } from "@/services/quiz.service";

export default function CreateQuizPage() {
  const { courseId } = useParams();

  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 0,
    timeLimit: 0,
    courseId,
  });

  const [loading, setLoading] =
    useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log(formData);

      await createQuiz(formData);

      router.push(
        `/instructor/courses/edit/${courseId}`
      );
    } catch (error) {
      console.log(
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to create quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 p-10 rounded-2xl">
        <h1 className="text-5xl font-bold mb-10">
          Create Quiz
        </h1>

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
            className="
              w-full
              rounded-lg
              border
              border-slate-700
              bg-slate-800
              px-4
              py-4
              text-white
              outline-none
              focus:border-orange-500
            "
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="
              w-full
              rounded-lg
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
            value={
              formData.passingScore
            }
            onChange={handleChange}
            className="
              w-full
              rounded-lg
              border
              border-slate-700
              bg-slate-800
              px-4
              py-4
              text-white
              outline-none
              focus:border-orange-500
            "
            required
          />

          <input
            type="number"
            name="timeLimit"
            placeholder="Time Limit (minutes)"
            value={
              formData.timeLimit
            }
            onChange={handleChange}
            className="
              w-full
              rounded-lg
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
              rounded-lg
              bg-orange-600
              px-8
              py-4
              font-semibold
              text-white
              hover:bg-orange-700
              transition
            "
          >
            {loading
              ? "Creating..."
              : "Create Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
}