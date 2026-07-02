"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function AttemptQuiz() {
  const router = useRouter();
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/questions/${quizId}`);

        const data = response.data.data || response.data;
        console.log(response);
        console.log(response.data);
        console.log(quizId);

        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuestions();
    }
  }, [quizId]);

  if (loading) {
    return <div className="text-white">Loading quiz...</div>;
  }

  if (!questions.length) {
    return <div className="text-white">No questions found</div>;
  }

  const question = questions[currentQuestion];

  const handleOptionSelect = (option) => {
    setAnswers({
      ...answers,
      [question.id]: option,
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      const payload = {
        answers: Object.entries(answers).map(
          ([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          }),
        ),
      };

      const response = await api.post(`/quizzes/${quizId}/submit`, payload);

      const result = response.data.data || response.data;

      localStorage.setItem("quizResult", JSON.stringify(result));

      router.push(`/student/result/${quizId}`);
    } catch (error) {
      console.error("Quiz submission failed", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz</h1>

        <span className="text-orange-500 font-bold">
          Question {currentQuestion + 1}/{questions.length}
        </span>
      </div>

      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-5">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option}
              className="
                block p-4 rounded-lg
                bg-slate-800
                cursor-pointer
              "
            >
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
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="
            px-5 py-2 rounded-lg
            bg-slate-700
            disabled:opacity-50
          "
        >
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={submitQuiz}
            className="
              px-5 py-2 rounded-lg
              bg-green-600
            "
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="
              px-5 py-2 rounded-lg
              bg-orange-500
            "
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
