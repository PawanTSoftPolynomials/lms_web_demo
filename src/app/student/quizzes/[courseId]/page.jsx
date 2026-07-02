"use client";

import { useParams } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import QuizCard from "@/components/student/QuizCard";

import useQuizzes from "@/hooks/queries/student/useQuizzes";

export default function StudentQuizzesPage() {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useQuizzes(courseId);

  const quizzes = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Card className="text-slate-300">Unable to load quizzes right now.</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quizzes" subtitle="Attempt quizzes for your enrolled courses." />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
        ) : (
          <Card className="text-slate-300">No quizzes available for this course yet.</Card>
        )}
      </div>
    </div>
  );
}