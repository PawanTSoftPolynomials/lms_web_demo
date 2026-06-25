"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getQuizzes, deleteQuiz } from "@/services/quiz.service";

import ActionMenu from "@/components/menus/ActionMenu";
import Loader from "@/components/common/Loader";

export default function QuizList() {
  const { courseId } = useParams();

  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadQuizzes();
    }
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      const data = await getQuizzes(courseId);
      setQuizzes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!confirm("Delete this quiz?")) {
      return;
    }

    try {
      await deleteQuiz(quizId);

      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
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
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>

          <p className="text-slate-400 mt-2">Manage quizzes and questions.</p>
        </div>

        <Link
          href={`/instructor/quizzes/create/${courseId}`}
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
          Add Quiz
        </Link>
      </div>

      {/* Empty State */}
      {quizzes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">No quizzes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                flex
                flex-col
                justify-between
                min-h-[180px]
                hover:border-orange-500
                transition
              "
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {quiz.title}
                    </h2>

                    <span
                      className="
                        inline-block
                        mt-2
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        bg-orange-500/20
                        text-orange-400
                      "
                    >
                      Quiz
                    </span>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: "Questions",
                        onClick: () =>
                          router.push(`/instructor/questions/${quiz.id}`),
                      },
                      {
                        label: "Edit",
                        onClick: () =>
                          router.push(`/instructor/quizzes/edit/${quiz.id}`),
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDelete(quiz.id),
                      },
                    ]}
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-slate-400">
                    Passing Score:
                    <span className="text-white ml-2">
                      {quiz.passingScore}%
                    </span>
                  </p>

                  <p className="text-slate-400">
                    Time Limit:
                    <span className="text-white ml-2">
                      {quiz.timeLimit} min
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() =>
                    router.push(`/instructor/questions/${quiz.id}`)
                  }
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
                  Manage Questions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
