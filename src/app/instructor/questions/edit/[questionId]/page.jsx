"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Loader from "@/components/common/Loader";

import QuestionForm from "@/components/forms/QuestionForm";

import {
  getQuestionById,
  updateQuestion,
} from "@/services/question.service";

export default function EditQuestionPage() {
  const { questionId } =
    useParams();

  const router =
    useRouter();

  const [question,
    setQuestion] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  useEffect(() => {
    const loadQuestion =
      async () => {
        try {
          const response =
            await getQuestionById(
              questionId
            );

          setQuestion(
            response.data ||
              response
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const handleSubmit =
    async (data) => {
      try {
        setSaving(true);

        await updateQuestion(
          questionId,
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 p-10 rounded-2xl">
        <h1 className="text-4xl font-bold text-white mb-8">
          Edit Question
        </h1>

        <QuestionForm
          initialData={{
            question:
              question.question,
            options:
              question.options ||
              ["", "", "", ""],
            correctAnswer:
              question.correctAnswer,
            marks:
              question.marks,
          }}
          onSubmit={
            handleSubmit
          }
          submitText="Update Question"
          loading={saving}
        />
      </div>
    </div>
  );
}