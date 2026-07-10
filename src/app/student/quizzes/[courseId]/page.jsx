"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getQuizzes,
} from "@/services/quiz.service";

export default function QuizPage() {
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
      const response =
        await getQuizzes(
          courseId
        );

      setQuizzes(response);
    };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Course Quizzes
      </h1>

      <div className="space-y-5">
        {quizzes.map(
          (quiz) => (
            <div
              key={quiz.id}
              className="
                bg-slate-900
                p-6
                rounded-xl
              "
            >
              <h2 className="text-2xl font-bold">
                {quiz.title}
              </h2>

              <p className="text-slate-400 mt-2">
                {quiz.description}
              </p>

              <p className="mt-3">
                Passing Score:
                {quiz.passingScore}%
              </p>

              <p>
                Time Limit:
                {quiz.timeLimit} min
              </p>

              <Link
                href={`/student/attempt/${quiz.id}`}
                className="
                  inline-block
                  mt-4
                  bg-orange-600
                  px-4
                  py-2
                  rounded
                "
              >
                Start Quiz
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}