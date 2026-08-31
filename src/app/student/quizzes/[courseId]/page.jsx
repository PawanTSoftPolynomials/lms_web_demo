"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import useQuizzes from "@/hooks/queries/student/useQuizzes";

export default function QuizPage() {
  const { courseId } = useParams();
  const { data: quizzes = [], isLoading, isError } = useQuizzes(courseId);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <Card className="p-8 text-center text-red-400">
        Failed to load course quizzes. Please try again later.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Quizzes"
        subtitle="Test your knowledge and practice key concepts."
      />

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No quizzes available for this course yet.
        </Card>
      ) : (
        <div className="space-y-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-background p-6 rounded-xl border border-transparent"
            >
              <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>

              {quiz.description && (
                <p className="text-muted-foreground mt-2 text-sm">{quiz.description}</p>
              )}

              <div className="mt-3 flex gap-4 text-xs text-foreground font-semibold">
                <span>Passing Score: {quiz.passingScore}%</span>
                <span>Time Limit: {quiz.timeLimit} min</span>
              </div>

              <Link
                href={`/student/attempt/${quiz.id}`}
                className="inline-block mt-4 bg-orange-600 hover:bg-primary text-foreground text-xs font-bold px-4 py-2 rounded transition cursor-pointer"
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}