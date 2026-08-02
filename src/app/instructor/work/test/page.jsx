"use client";

import { CheckCircle2 } from "lucide-react";

import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import ExamForm from "@/components/instructor/ExamForm";
import { useWorkFilters } from "@/context/WorkFilterContext";
import { useCreateExam } from "@/hooks/queries/instructor/useExams";

export default function WorkCreateTestPage() {
  const { appliedFilters } = useWorkFilters();
  const createExam = useCreateExam();

  const courseId = appliedFilters.courseId;
  const batchId = appliedFilters.batchId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Create Test</h1>
        <p className="text-xs text-slate-400 mt-1">Schedule a timed test for a course, optionally scoped to one batch.</p>
      </div>

      <WorkFilterBar fields={["course", "batch"]} />

      {createExam.isSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <CheckCircle2 size={15} />
          Test published successfully.
        </div>
      )}

      {!courseId ? (
        <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#0D1021] py-16 text-center">
          <p className="text-xs font-bold text-slate-500">Select a course above and click Apply to schedule a test.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-6">
          <ExamForm
            key={`${courseId}-${batchId}`}
            courseId={courseId}
            batchId={batchId}
            loading={createExam.isPending}
            submitError={createExam.isError ? (createExam.error?.response?.data?.message || "Failed to publish test.") : ""}
            onSubmit={(payload) => createExam.mutate(payload)}
          />
        </div>
      )}
    </div>
  );
}
