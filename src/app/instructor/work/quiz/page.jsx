"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, PenLine, CheckCircle2 } from "lucide-react";

import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import QuizForm from "@/components/instructor/quizzes/QuizForm";
import { useWorkFilters } from "@/context/WorkFilterContext";
import { useCreateQuiz } from "@/hooks/queries/instructor/useCreateQuiz";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";

export default function WorkCreateQuizPage() {
  const { appliedFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();
  const createQuizMutation = useCreateQuiz();
  const [createdQuiz, setCreatedQuiz] = useState(null);

  const courseId = appliedFilters.courseId;
  const course = courses.find((c) => c.id === courseId);

  const handleSubmit = async (values, action) => {
    const payload = {
      ...values,
      courseId,
      status: action === "draft" ? "DRAFT" : "ACTIVE",
      isPublished: action !== "draft",
    };

    const newQuiz = await createQuizMutation.mutateAsync(payload);
    setCreatedQuiz(newQuiz);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Create Quiz</h1>
        <p className="text-xs text-slate-400 mt-1">Select a course, then build the quiz shell and choose how to add its questions.</p>
      </div>

      <WorkFilterBar fields={["course"]} />

      {!courseId ? (
        <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#0D1021] py-16 text-center">
          <p className="text-xs font-bold text-slate-500">Select a course above and click Apply to start creating a quiz.</p>
        </div>
      ) : createdQuiz ? (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-6 space-y-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <p className="text-sm font-black">"{createdQuiz.title}" was created under {course?.title}. Now add its questions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/instructor/quizzes/${createdQuiz.id}/import-questions`}
              className="p-5 rounded-xl border border-[#1A1F35] bg-white/[0.02] hover:border-orange-500/50 transition flex flex-col gap-2"
            >
              <Database size={18} className="text-orange-450" />
              <p className="text-sm font-bold text-white">Import from Question Repository</p>
              <p className="text-[11px] text-slate-400">Pick existing questions from your repository to build this quiz.</p>
            </Link>
            <Link
              href={`/instructor/questions/create/${createdQuiz.id}`}
              className="p-5 rounded-xl border border-[#1A1F35] bg-white/[0.02] hover:border-orange-500/50 transition flex flex-col gap-2"
            >
              <PenLine size={18} className="text-orange-450" />
              <p className="text-sm font-bold text-white">Manual Question Selection</p>
              <p className="text-[11px] text-slate-400">Write new questions directly for this quiz.</p>
            </Link>
          </div>
          <button
            onClick={() => setCreatedQuiz(null)}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition"
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
