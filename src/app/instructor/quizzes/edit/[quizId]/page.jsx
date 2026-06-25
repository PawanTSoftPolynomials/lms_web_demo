"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import QuizForm from "@/components/forms/QuizForm";

import {
  getQuizById,
  updateQuiz,
} from "@/services/quiz.service";

import Loader from "@/components/common/Loader";

export default function EditQuizPage() {
  const { quizId } =
    useParams();

  const router =
    useRouter();

  const [quiz, setQuiz] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const loadQuiz =
      async () => {
        try {
          const response =
            await getQuizById(
              quizId
            );

          setQuiz(
            response.data ||
              response
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleSubmit =
    async (data) => {
      try {
        setSaving(true);

        await updateQuiz(
          quizId,
          data
        );

        router.back();
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 p-10 rounded-2xl">
        <h1 className="text-4xl font-bold text-white mb-8">
          Edit Quiz
        </h1>

        <QuizForm
          initialData={quiz}
          onSubmit={handleSubmit}
          submitText="Update Quiz"
          loading={saving}
        />
      </div>
    </div>
  );
}