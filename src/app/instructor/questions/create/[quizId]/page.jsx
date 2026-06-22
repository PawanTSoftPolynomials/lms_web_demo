"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  createQuestion,
} from "@/services/question.service";

export default function CreateQuestion() {
  const { quizId } =
    useParams();

  const router =
    useRouter();

  const [formData,
    setFormData] =
    useState({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
      marks: 1,
    });

  const handleChange =
    (e) => {
      setFormData({
        ...formData,
        [e.target.name]:
          e.target.value,
      });
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      await createQuestion({
        quizId,
        question:
          formData.question,
        options: [
          formData.option1,
          formData.option2,
          formData.option3,
          formData.option4,
        ],
        correctAnswer:
          formData.correctAnswer,
        marks: Number(
          formData.marks
        ),
      });

      router.push(
        `/instructor/questions/${quizId}`
      );
    };

  return (
    <div className="bg-slate-900 p-8 rounded-xl">
      <h1 className="text-4xl font-bold mb-8">
        Create Question
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <textarea
          name="question"
          placeholder="Question"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="option1"
          placeholder="Option 1"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="option2"
          placeholder="Option 2"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="option3"
          placeholder="Option 3"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="option4"
          placeholder="Option 4"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="correctAnswer"
          placeholder="Correct Answer"
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          type="number"
          name="marks"
          value={formData.marks}
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <button
          className="bg-orange-600 px-6 py-3 rounded"
        >
          Create Question
        </button>
      </form>
    </div>
  );
}