"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getQuestions,
  deleteQuestion,
} from "@/services/question.service";

import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";

export default function QuestionListPage() {
  const { quizId } = useParams();

  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      loadQuestions();
    }
  }, [quizId]);

  const loadQuestions = async () => {
    try {
      const data = await getQuestions(quizId);

      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm("Delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(questionId);

      setQuestions(
        questions.filter(
          (question) =>
            question.id !== questionId
        )
      );
    } catch (error) {
      console.error(error);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Questions
          </h1>

          <p className="text-slate-400 mt-2">
            Manage quiz questions.
          </p>
        </div>

        <Link
          href={`/instructor/questions/create/${quizId}`}
          className="
            bg-orange-600
            hover:bg-orange-700
            px-4
            py-2
            rounded-lg
            text-white
            transition
          "
        >
          Add Question
        </Link>
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">
            No questions found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {questions.map((question) => (
            <div
              key={question.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                flex
                flex-col
                justify-between
                min-h-[220px]
                hover:border-orange-500
                transition
              "
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className="
                        inline-block
                        mb-3
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        bg-orange-500/20
                        text-orange-400
                      "
                    >
                      Question
                    </span>

                    <h2 className="text-xl font-semibold text-white">
                      {question.question}
                    </h2>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: "Edit",
                        onClick: () =>
                          router.push(
                            `/instructor/questions/edit/${question.id}`
                          ),
                      },
                      {
                        label: "Delete",
                        onClick: () =>
                          handleDelete(question.id),
                      },
                    ]}
                  />
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                      {question.marks} Marks
                    </span>

                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                      {question.correctAnswer}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  className="
                    bg-orange-500
                    hover:bg-orange-600
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    text-white
                    transition
                  "
                >
                  View Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}