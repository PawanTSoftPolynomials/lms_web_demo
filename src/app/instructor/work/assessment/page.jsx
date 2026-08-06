"use client";

import { CheckCircle2 } from "lucide-react";

import Card from "@/components/ui/Card";
import AssessmentForm from "@/components/instructor/AssessmentForm";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCreateAssignment } from "@/hooks/queries/instructor/useAssignments";

export default function WorkCreateAssessmentPage() {
  const { data: courses = [] } = useInstructorCourses();
  const createAssignment = useCreateAssignment();

  const handleSubmit = (payload) => {
    createAssignment.mutate(payload);
  };

  return (
    <Card className="mx-auto max-w-4xl bg-[#0D1021] border border-[#1A1F35] p-6 sm:p-8 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Create Assessment</h1>
        <p className="mt-2 text-sm text-slate-400">Set up a gradable assessment — homework, project, case study, or practical.</p>
      </div>

      {createAssignment.isSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle2 size={15} />
          Assessment saved successfully.
        </div>
      )}

      <AssessmentForm
        mode="create"
        courses={courses}
        loading={createAssignment.isPending}
        submitError={createAssignment.isError ? (createAssignment.error?.response?.data?.message || "Failed to save assessment.") : ""}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
