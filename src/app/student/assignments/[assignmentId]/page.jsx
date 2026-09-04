"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import useAssignment from "@/hooks/queries/student/useAssignment";
import useSubmitAssignment from "@/hooks/queries/student/useSubmitAssignment";
import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

export default function AssignmentDetailPage({ params }) {
  const { assignmentId } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const {
    data: assignment,
    isLoading,
    isError,
  } = useAssignment(assignmentId);

  const mutation = useSubmitAssignment(assignmentId);

  const handleSubmit = () => {
    mutation.mutate(
      { notes },
      {
        onSuccess: () => {
          router.push("/student/assignments");
        },
      }
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !assignment) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Assignment not found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The requested assignment could not be loaded.
        </p>
      </Card>
    );
  }

  const status = normalizeAssignmentStatus(assignment);

  return (
    <div className="space-y-8">
      <PageHeader
        title={assignment.title}
        subtitle={assignment.course?.title || assignment.courseTitle || "Assignment details"}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card tone="flat">
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{status}</p>
                </div>
                <div className="rounded-full bg-muted px-4 py-2 text-sm text-foreground">
                  Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "No due date"}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Description</h3>
                  <p className="mt-3 text-muted-foreground whitespace-pre-line">
                    {assignment.description || "No description available."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {assignment.totalQuestions ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {assignment.estimatedTime ? `${assignment.estimatedTime} min` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card tone="flat">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-foreground">Submit Your Work</h3>
              <p className="text-sm text-muted-foreground">
                Provide a summary or submission notes for your assignment here. You can revise this before submission.
              </p>
              <label className="space-y-2 text-sm text-foreground">
                <span>Submission Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your assignment submission details..."
                  className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary min-h-40 resize-none"
                />
              </label>
              <Button
                type="button"
                onClick={handleSubmit}
                loading={mutation.isPending}
                disabled={status === "Graded"}
              >
                {status === "Graded" ? "Already Graded" : "Submit Assignment"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card tone="flat">
            <h3 className="text-lg font-semibold text-foreground">Assignment Summary</h3>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-2xl bg-background p-4">
                <span>Course</span>
                <span className="text-foreground">{assignment.course?.title || assignment.courseTitle || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-background p-4">
                <span>Due Date</span>
                <span className="text-foreground">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-background p-4">
                <span>Status</span>
                <span className="text-foreground">{status}</span>
              </div>
            </div>
          </Card>

          <Card tone="flat">
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Contact your instructor if you have questions about the assignment requirements or submission format.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
