"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuestionById,
  updateQuestion,
} from "@/services/question.service";

export default function EditQuestion() {
  const { questionId } =
    useParams();

  const router =
    useRouter();

  const [formData,
    setFormData] =
    useState({
      question: "",
      correctAnswer: "",
      marks: 1,
    });

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion =
    async () => {
      const data =
        await getQuestionById(
          questionId
        );

      setFormData(data);
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

      await updateQuestion(
        questionId,
        formData
      );

      router.back();
    };

  return (
    <div className="bg-slate-900 p-8 rounded-xl">
      <h1 className="text-4xl font-bold mb-8">
        Edit Question
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <textarea
          name="question"
          value={
            formData.question
          }
          onChange={
            handleChange
          }
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          name="correctAnswer"
          value={
            formData.correctAnswer
          }
          onChange={
            handleChange
          }
          className="w-full p-4 rounded bg-slate-800"
        />

        <input
          type="number"
          name="marks"
          value={
            formData.marks
          }
          onChange={
            handleChange
          }
          className="w-full p-4 rounded bg-slate-800"
        />

        <button
          className="bg-orange-600 px-6 py-3 rounded"
        >
          Update Question
        </button>
      </form>
    </div>
  );
}