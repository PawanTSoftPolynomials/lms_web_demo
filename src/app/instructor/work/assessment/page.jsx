"use client";

import { CheckCircle2 } from "lucide-react";

import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import AssessmentForm from "@/components/instructor/AssessmentForm";
import { useWorkFilters } from "@/context/WorkFilterContext";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCreateAssignment } from "@/hooks/queries/instructor/useAssignments";

export default function WorkCreateAssessmentPage() {
  const { appliedFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();
  const createAssignment = useCreateAssignment();

  const courseId = appliedFilters.courseId;

  const handleSubmit = (payload) => {
    createAssignment.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Create Assessment</h1>
        <p className="text-xs text-slate-400 mt-1">Set up a gradable assessment — homework, project, case study, or practical.</p>
      </div>

      <WorkFilterBar fields={["course"]} />

      {createAssignment.isSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle2 size={15} />
          Assessment saved successfully.
        </div>
      )}

      {!courseId ? (
        <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#0D1021] py-16 text-center">
          <p className="text-xs font-bold text-slate-500">Select a course above and click Apply to create an assessment.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-6">
          <AssessmentForm
            key={courseId}
            mode="create"
            courses={courses}
            lockedCourseId={courseId}
            loading={createAssignment.isPending}
            submitError={createAssignment.isError ? (createAssignment.error?.response?.data?.message || "Failed to save assessment.") : ""}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
