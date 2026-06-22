"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getQuestions,
  deleteQuestion,
} from "@/services/question.service";

export default function QuestionList() {
  const { quizId } = useParams();

  const [questions, setQuestions] =
    useState([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions =
    async () => {
      const data =
        await getQuestions(
          quizId
        );

      setQuestions(data);
    };

  const handleDelete =
    async (questionId) => {
      await deleteQuestion(
        questionId
      );

      loadQuestions();
    };

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Questions
        </h1>

        <Link
          href={`/instructor/questions/create/${quizId}`}
          className="bg-orange-600 px-5 py-3 rounded"
        >
          Add Question
        </Link>
      </div>

      <div className="space-y-4">
        {questions.map(
          (question) => (
            <div
              key={question.id}
              className="bg-slate-900 p-6 rounded-xl"
            >
              <h2 className="text-xl font-bold">
                {question.question}
              </h2>

              <p>
                Marks:
                {question.marks}
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/instructor/questions/edit/${question.id}`}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    handleDelete(
                      question.id
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