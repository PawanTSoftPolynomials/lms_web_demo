"use client";

import { useEffect, useState } from "react";

export default function ResultPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("quizResult");

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  if (!result) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-white">No result found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-slate-900 p-10 rounded-xl text-center min-w-[400px]">
        <h1 className="text-4xl font-bold">Quiz Result</h1>

        <p className="text-2xl text-orange-500 mt-5">
          Score: {result.score} / {result.totalMarks}
        </p>

        <p className="text-xl mt-3">Percentage: {result.percentage}%</p>

        <p
          className={`mt-4 text-lg font-semibold ${
            result.passed ? "text-green-500" : "text-red-500"
          }`}
        >
          {result.passed ? "Passed 🎉" : "Failed"}
        </p>

        <p className="text-gray-400 mt-3">
          {result.passed ? "Great job!" : "Try again."}
        </p>
      </div>
    </div>
  );
}
