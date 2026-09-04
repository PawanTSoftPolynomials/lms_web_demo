"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, PenLine, CheckCircle2 } from "lucide-react";

import QuizForm from "@/components/instructor/quizzes/QuizForm";
import { useCreateQuiz } from "@/hooks/queries/instructor/useCreateQuiz";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";

export default function WorkCreateQuizPage() {
  // Still fetched for the "created quiz belongs to which course" confirmation
  // panel below — QuizForm resolves its own course list internally.
  const { data: courses = [] } = useInstructorCourses();
  const createQuizMutation = useCreateQuiz();
  const [createdQuiz, setCreatedQuiz] = useState(null);

  const handleSubmit = async (values, action) => {
    const payload = {
      ...values,
      status: action === "draft" ? "DRAFT" : "ACTIVE",
      isPublished: action !== "draft",
    };

    const newQuiz = await createQuizMutation.mutateAsync(payload);
    setCreatedQuiz(newQuiz);
  };

  const createdQuizCourse = createdQuiz && courses.find((c) => c.id === createdQuiz.courseId);

  return (
    <div className="space-y-6">
      {createdQuiz ? (
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <p className="text-sm font-black">"{createdQuiz.title}" was created under {createdQuizCourse?.title}. Now add its questions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/instructor/quizzes/${createdQuiz.id}/import-questions`}
              className="p-5 rounded-xl border border-border bg-white/[0.02] hover:border-primary/50 transition flex flex-col gap-2"
            >
              <Database size={18} className="text-orange-450" />
              <p className="text-sm font-bold text-foreground">Import from Question Repository</p>
              <p className="text-[11px] text-muted-foreground">Pick existing questions from your repository to build this quiz.</p>
            </Link>
            <Link
              href={`/instructor/questions/create/${createdQuiz.id}`}
              className="p-5 rounded-xl border border-border bg-white/[0.02] hover:border-primary/50 transition flex flex-col gap-2"
            >
              <PenLine size={18} className="text-orange-450" />
              <p className="text-sm font-bold text-foreground">Manual Question Selection</p>
              <p className="text-[11px] text-muted-foreground">Write new questions directly for this quiz.</p>
            </Link>
          </div>
          <button
            onClick={() => setCreatedQuiz(null)}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition"
          >
            Create another quiz
          </button>
        </div>
      ) : (
        <QuizForm mode="create" onSubmit={handleSubmit} loading={createQuizMutation.isPending} />
      )}
    </div>
  );
}
