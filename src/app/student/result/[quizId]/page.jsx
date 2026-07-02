"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";

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
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="text-slate-300">No result found.</Card>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] items-center justify-center">
      <Card className="min-w-[320px] text-center">
        <h1 className="text-4xl font-bold text-white">Quiz Result</h1>
        <p className="mt-5 text-2xl text-orange-500">Score: {result.score ?? 0} / {result.totalMarks ?? 0}</p>
        <p className="mt-3 text-xl text-slate-300">Percentage: {result.percentage ?? 0}%</p>
        <p className={`mt-4 text-lg font-semibold ${result.passed ? "text-green-500" : "text-red-500"}`}>
          {result.passed ? "Passed 🎉" : "Failed"}
        </p>
        <p className="mt-3 text-slate-400">{result.passed ? "Great job!" : "Try again."}</p>
        <Link href="/student/quizzes" className="mt-6 inline-flex rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">
          Back to Quizzes
        </Link>
      </Card>
    </div>
  );
}
