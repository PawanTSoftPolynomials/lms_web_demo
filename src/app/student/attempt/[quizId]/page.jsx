"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/common/Loader";

import useQuizQuestions from "@/hooks/queries/students/useQuizQuestions";
import useSubmitQuiz from "@/hooks/queries/students/useSubmitQuiz";

export default function AttemptQuiz() {
  const router = useRouter();
  const { quizId } = useParams();
  const { data, isLoading, isError } = useQuizQuestions(quizId);
  const submitQuizMutation = useSubmitQuiz();

  const questions = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !questions.length) {
    return <Card className="text-slate-300">No questions found for this quiz.</Card>;
  }

  const question = questions[currentQuestion];

  const handleOptionSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitQuiz = async () => {
    const payload = {
      answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })),
    };

    try {
      const result = await submitQuizMutation.mutateAsync({ quizId, payload });
      localStorage.setItem("quizResult", JSON.stringify(result));
      router.push(`/student/result/${quizId}`);
    } catch (error) {
      console.error("Quiz submission failed", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Quiz Attempt" subtitle="Answer each question and submit your quiz when you are done." />

      <Card className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{question.question}</h2>
          <span className="font-semibold text-orange-500">Question {currentQuestion + 1}/{questions.length}</span>
        </div>

        <div className="space-y-3">
          {(question.options || []).map((option) => (
            <label key={option} className="block cursor-pointer rounded-lg border border-slate-800 bg-slate-900 p-4">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleOptionSelect(option)}
                className="mr-3"
              />
              {option}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <Button onClick={prevQuestion} disabled={currentQuestion === 0} className="bg-slate-700 hover:bg-slate-600">
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={submitQuiz} loading={submitQuizMutation.isPending} className="bg-green-600 hover:bg-green-700">
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-orange-500 hover:bg-orange-600">
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
