"use client";

import { useEffect, useState } from "react";

import QuizCard from "@/components/students/QuizCard";
import { getQuizzes } from "../../../services/quiz.service";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();
        const data = response.data || response;

        const formattedQuizzes = data.map(
          (quiz) => ({
            id: quiz.id,
            title: quiz.title,
            duration: quiz.timeLimit || 0,
            questions: "N/A",
          })
        );

        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error(
          "Quiz fetch failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        Loading quizzes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Quizzes
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
            />
          ))
        ) : (
          <p className="text-gray-400">
            No quizzes available.
          </p>
        )}
      </div>
    </div>
  );
}