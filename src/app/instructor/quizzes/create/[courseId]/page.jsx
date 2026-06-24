"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useState } from "react";

import QuizForm from "@/components/quizzes/QuizForm";

import {
  createQuiz,
} from "@/services/quiz.service";

export default function CreateQuizPage() {
  const { courseId } =
    useParams();

  const router =
    useRouter();

  const [loading,
    setLoading] =
    useState(false);

  const handleSubmit =
    async (data) => {
      try {
        setLoading(true);

        await createQuiz({
          ...data,
          courseId,
        });

        router.push(
          `/instructor/quizzes/${courseId}`
        );
      } catch (error) {
        console.error(error);

        alert(
          error.response?.data
            ?.message ||
            "Failed to create quiz"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 p-10 rounded-2xl">
        <h1 className="text-4xl font-bold text-white mb-8">
          Create Quiz
        </h1>

        <QuizForm
          onSubmit={handleSubmit}
          submitText="Create Quiz"
          loading={loading}
        />
      </div>
    </div>
  );
}