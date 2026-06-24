"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuestions,
  deleteQuestion,
} from "@/services/question.service";

import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";

export default function QuestionListPage() {
  const { quizId } =
    useParams();

  const router =
    useRouter();

  const [questions,
    setQuestions] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions =
    async () => {
      try {
        const data =
          await getQuestions(
            quizId
          );

        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const handleDelete =
    async (questionId) => {
      if (
        !confirm(
          "Delete this question?"
        )
      ) {
        return;
      }

      try {
        await deleteQuestion(
          questionId
        );

        setQuestions(
          questions.filter(
            (question) =>
              question.id !==
              questionId
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
          <h1 className="text-4xl font-bold text-white">
            Questions
          </h1>

          <p className="text-slate-400 mt-1">
            Manage quiz questions.
          </p>
        </div>

        <Link
          href={`/instructor/questions/create/${quizId}`}
          className="
            bg-orange-600
            hover:bg-orange-700
            px-5
            py-3
            rounded-xl
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
        <div className="space-y-4">
          {questions.map(
            (question) => (
              <div
                key={question.id}
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                  flex
                  justify-between
                  items-start
                  hover:border-orange-500
                  transition
                "
              >
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">
                    {question.question}
                  </h2>

                  <div className="flex gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                      {question.marks} Marks
                    </span>

                    <span className="px-3 py-1 rounded-full bg-green-900 text-green-300 text-sm">
                      Correct:
                      {" "}
                      {question.correctAnswer}
                    </span>
                  </div>
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
                        handleDelete(
                          question.id
                        ),
                    },
                  ]}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}