"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import { getQuizzes } from "@/services/quiz.service";

export default function QuizzesPage() {
  const router = useRouter();

  const [quizzes, setQuizzes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadQuizzes =
      async () => {
        try {
          const response =
            await getQuizzes();

          setQuizzes(response);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadQuizzes();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">
        Quizzes
      </h1>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="
              cursor-pointer
              hover:border-orange-500
              transition
            "
            onClick={() =>
              router.push(
                `/instructor/quizzes/${quiz.courseId}`
              )
            }
          >
            <h2 className="text-2xl font-semibold">
              {quiz.title}
            </h2>

            <p className="text-slate-400 mt-2">
              {quiz.description}
            </p>

            <div className="flex gap-6 mt-4 text-sm text-slate-400">
              <span>
                Passing:
                {quiz.passingScore}%
              </span>

              <span>
                Time:
                {quiz.timeLimit} min
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}