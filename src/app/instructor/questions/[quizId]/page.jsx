"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import QuestionGrid from "@/components/instructor/questions/QuestionGrid";

import { useQuestions } from "@/hooks/queries/instructor/useQuestions";
import { useDeleteQuestion } from "@/hooks/queries/instructor/useDeleteQuestion";
import { useQuiz } from "@/hooks/queries/instructor/useQuiz";

export default function QuestionListPage() {
  const params = useParams();
  const quizId = params.quizId;

  const { data: quizData } = useQuiz(quizId, { enabled: !!quizId });
  const courseId = params.courseId || quizData?.courseId;

  const {
    data: questions = [],
    isLoading,
    isError,
  } = useQuestions(quizId);

  const deleteQuestionMutation =
      useDeleteQuestion();

  const handleDelete = async (
      questionId
  ) => {
    if (
        !window.confirm(
            "Delete this question?"
        )
    ) {
      return;
    }

    try {
      await deleteQuestionMutation.mutateAsync({
        questionId,
        quizId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
    );
  }

  if (isError) {
    return (
        <Card>
          <div className="py-16 text-center">
            <h2 className="text-2xl font-semibold">
              Failed to Load Questions
            </h2>

            <p className="mt-2 text-slate-400">
              Please try again later.
            </p>
          </div>
        </Card>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Questions
            </h1>

            <p className="mt-2 text-slate-400">
              Manage quiz questions.
            </p>
          </div>

          <Link
              href={`/instructor/courses/${courseId}/quizzes/${quizId}/questions/create`}
              className="
                        rounded-xl
                        bg-orange-600
                        px-5
                        py-3
                        text-white
                        transition
                        hover:bg-orange-700
                    "
          >
            Add Question
          </Link>
        </div>

        <QuestionGrid
            questions={questions}
            quizId={quizId}
            courseId={courseId}
            onDelete={handleDelete}
        />
      </div>
  );
}