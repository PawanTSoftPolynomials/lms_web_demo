"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getQuizzes,
  deleteQuiz,
} from "@/services/quiz.service";

export default function QuizList() {
  const { courseId } =
    useParams();

  const [quizzes,
    setQuizzes] =
    useState([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes =
    async () => {
      const data =
        await getQuizzes(
          courseId
        );

      setQuizzes(data);
    };

  const handleDelete =
    async (quizId) => {
      await deleteQuiz(
        quizId
      );

      loadQuizzes();
    };

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Quizzes
        </h1>

        <Link
          href={`/instructor/quizzes/create/${courseId}`}
          className="bg-orange-600 px-5 py-3 rounded"
        >
          Add Quiz
        </Link>
      </div>

      <div className="space-y-4">
        {quizzes.map(
          (quiz) => (
            <div
              key={quiz.id}
              className="bg-slate-900 p-6 rounded-xl flex justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold">
                  {quiz.title}
                </h2>

                <p>
                  Passing:
                  {quiz.passingScore}%
                </p>

                <p>
                  Time:
                  {quiz.timeLimit} min
                </p>
              </div>

              <div className="space-x-3">
                <Link
                  href={`/instructor/questions/${quiz.id}`}
                  className="bg-green-600 px-4 py-2 rounded"
                >
                  Questions
                </Link>

                <Link
                  href={`/instructor/quizzes/edit/${quiz.id}`}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    handleDelete(
                      quiz.id
                    )
                  }
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}