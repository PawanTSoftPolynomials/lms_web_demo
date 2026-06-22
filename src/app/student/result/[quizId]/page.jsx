"use client";

import {
  useEffect,
  useState,
} from "react";

export default function QuizResult() {
  const [result,
    setResult] =
    useState(null);

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "quizResult"
      );

    if (stored) {
      setResult(
        JSON.parse(stored)
      );
    }
  }, []);

  if (!result) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-slate-900 p-8 rounded-xl">
        <h1 className="text-4xl font-bold mb-8">
          Quiz Result
        </h1>

        <div className="space-y-4 text-xl">
          <p>
            Score:
            {result.score}
          </p>

          <p>
            Total:
            {result.totalMarks}
          </p>

          <p>
            Percentage:
            {result.percentage}%
          </p>

          <p
            className={
              result.passed
                ? "text-green-500"
                : "text-red-500"
            }
          >
            {result.passed
              ? "PASS"
              : "FAIL"}
          </p>
        </div>
      </div>
    </div>
  );
}