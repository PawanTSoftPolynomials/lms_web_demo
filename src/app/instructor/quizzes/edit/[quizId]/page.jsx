"use client";

import { useParams }
  from "next/navigation";

import { useRouter }
  from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuizById,
  updateQuiz,
} from "@/services/quiz.service";

export default function EditQuiz() {
  const { quizId } =
    useParams();

  const router =
    useRouter();

  const [formData,
    setFormData] =
    useState({
      title: "",
      description: "",
      passingScore: 70,
      timeLimit: 30,
    });

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz =
    async () => {
      const quiz =
        await getQuizById(
          quizId
        );

      setFormData(quiz);
    };

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

      await updateQuiz(
        quizId,
        formData
      );

      router.back();
    };

  return (
    <div className="bg-slate-900 p-8 rounded-xl">
      <h1 className="text-4xl font-bold mb-6">
        Edit Quiz
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          type="number"
          name="passingScore"
          value={
            formData.passingScore
          }
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          type="number"
          name="timeLimit"
          value={
            formData.timeLimit
          }
          onChange={handleChange}
          className="w-full p-4 rounded bg-slate-800"
        />

        <button
          className="bg-orange-600 px-6 py-3 rounded"
        >
          Update Quiz
        </button>
      </form>
    </div>
  );
}