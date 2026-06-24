"use client";

import { useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import QuestionForm from "@/components/forms/QuestionForm";

import {
  createQuestion,
} from "@/services/question.service";

export default function CreateQuestion() {
  const { quizId } =
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

        await createQuestion({
          ...data,
          quizId,
        });

        router.push(
          `/instructor/questions/${quizId}`
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 p-10 rounded-2xl">
        <h1 className="text-4xl font-bold mb-8">
          Create Question
        </h1>

        <QuestionForm
          onSubmit={handleSubmit}
          submitText="Create Question"
          loading={loading}
        />
      </div>
    </div>
  );
}