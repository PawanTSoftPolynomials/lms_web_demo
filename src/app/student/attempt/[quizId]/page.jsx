"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { getQuizById } from "@/services/quiz.service";

export default function AttemptQuiz() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    const response = await getQuizById(quizId);

    setQuiz(response);
  };

  const handleSelect = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  if (!quiz) return <div>Loading...</div>;
const router =
  useRouter();
  const handleSubmit = () => {
  let score = 0;

  quiz.questions.forEach(
    (question) => {
      if (
        answers[question.id] ===
        question.correctAnswer
      ) {
        score += question.marks;
      }
    }
  );

  const totalMarks =
    quiz.questions.reduce(
      (total, question) =>
        total + question.marks,
      0
    );

  const percentage =
    Math.round(
      (score / totalMarks) * 100
    );

  const result = {
    score,
    totalMarks,
    percentage,
    passed:
      percentage >=
      quiz.passingScore,
  };

  localStorage.setItem(
    "quizResult",
    JSON.stringify(result)
  );

  router.push(
    `/student/result/${quiz.id}`
  );
};
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{quiz.title}</h1>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div
            key={question.id}
            className="
                bg-slate-900
                p-6
                rounded-xl
              "
          >
            <h2 className="text-xl font-bold">
              {index + 1}.{question.question}
            </h2>

            <div className="mt-4 space-y-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className="
                        block
                      "
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    onChange={() => handleSelect(question.id, option)}
                  />

                  <span className="ml-3">{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              className="
    mt-8
    bg-orange-600
    px-6
    py-3
    rounded-lg
    font-semibold
  "
            >
              Submit Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
