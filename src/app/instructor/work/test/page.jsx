"use client";

import { CheckCircle2 } from "lucide-react";

import Card from "@/components/ui/Card";
import ExamForm from "@/components/instructor/ExamForm";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCreateExam } from "@/hooks/queries/instructor/useExams";

export default function WorkCreateTestPage() {
  const { data: courses = [] } = useInstructorCourses();
  const createExam = useCreateExam();

  return (
    <Card className="mx-auto max-w-4xl bg-[#0D1021] border border-[#1A1F35] p-6 sm:p-8 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Create Test</h1>
        <p className="mt-2 text-sm text-slate-400">Schedule a timed test for a course, optionally scoped to one batch.</p>
      </div>

      {createExam.isSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle2 size={15} />
          Test published successfully.
        </div>
      )}

      <ExamForm
        courses={courses}
        loading={createExam.isPending}
        submitError={createExam.isError ? (createExam.error?.response?.data?.message || "Failed to publish test.") : ""}
        onSubmit={(payload) => createExam.mutate(payload)}
      />
    </Card>
  );
}
