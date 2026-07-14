"use client";

import { useState, use } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAssignment from "@/hooks/queries/student/useAssignment";
import { submitAssignment } from "@/services/assignment.service";

export default function AssignmentDetailPage({ params }) {
  const { assignmentId } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const {
    data: assignment,
    isLoading,
    isError,
  } = useAssignment(assignmentId);

  const mutation = useMutation({
    mutationFn: (payload) => submitAssignment(assignmentId, payload),
    onSuccess: () => {
      router.push("/student/assignments");
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !assignment) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">
          Assignment not found
        </h2>
        <p className="mt-2 text-slate-400">
          The requested assignment could not be loaded.
        </p>
      </Card>
    );
  }

  const status = assignment.status || assignment.submissionStatus || "Not Submitted";

  return (
    <div className="space-y-8">
      <PageHeader
        title={assignment.title}
        subtitle={assignment.course?.title || assignment.courseTitle || "Assignment details"}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="mt-1 text-lg font-semibold text-white">{status}</p>
                </div>
                <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                  Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "No due date"}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Description</h3>
                  <p className="mt-3 text-slate-400 whitespace-pre-line">
                    {assignment.description || "No description available."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Questions</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {assignment.totalQuestions ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Estimated Time</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {assignment.estimatedTime ? `${assignment.estimatedTime} min` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Submit Your Work</h3>
              <p className="text-sm text-slate-400">
                Provide a summary or submission notes for your assignment here. You can revise this before submission.
              </p>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Submission Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your assignment submission details..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 min-h-40 resize-none"
                />
              </label>
              <Button
                type="button"
                onClick={() => mutation.mutate({ notes })}
                loading={mutation.isLoading}
                disabled={status === "Graded"}
              >
                {status === "Graded" ? "Already Graded" : "Submit Assignment"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-white">Assignment Summary</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-400">
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4">
                <span>Course</span>
                <span className="text-white">{assignment.course?.title || assignment.courseTitle || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4">
                <span>Due Date</span>
                <span className="text-white">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4">
                <span>Status</span>
                <span className="text-white">{status}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-white">Need Help?</h3>
            <p className="mt-4 text-sm text-slate-400">
              Contact your instructor if you have questions about the assignment requirements or submission format.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
