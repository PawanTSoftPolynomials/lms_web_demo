"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import { getQuestions } from "@/services/question.service";

export default function QuestionsPage() {
  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadQuestions =
      async () => {
        try {
          const response =
            await getQuestions();

          setQuestions(response);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadQuestions();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">
        Questions
      </h1>

      <div className="grid gap-4">
        {questions.map(
          (question) => (
            <Card
              key={question.id}
            >
              <h2 className="text-xl font-semibold">
                {
                  question.question
                }
              </h2>

              <p className="text-slate-400 mt-3">
                Marks:
                {" "}
                {question.marks}
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Correct Answer:
                {" "}
                {
                  question.correctAnswer
                }
              </p>
            </Card>
          )
        )}
      </div>
    </div>
  );
}