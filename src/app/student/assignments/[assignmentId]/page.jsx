"use client";

import { use } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import useAssignment from "@/hooks/queries/student/useAssignment";
import AssignmentSubmissionPanel from "@/components/student/assignments/AssignmentSubmissionPanel";
import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

export default function AssignmentDetailPage({ params }) {
  const { assignmentId } = use(params);

  const {
    data: assignment,
    isLoading,
    isError,
  } = useAssignment(assignmentId);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !assignment) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">
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
        {/* Brief, instructor reference material and the single PDF submission
            control — the same component the learning workspace renders, so
            both entry points behave identically. */}
        <div className="space-y-6">
          <AssignmentSubmissionPanel assignment={assignment} completed={status === "Submitted" || status === "Graded"} />
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
