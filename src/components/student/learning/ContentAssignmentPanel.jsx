"use client";

import Loader from "@/components/common/Loader";
import useContentSubmission from "@/hooks/queries/student/useContentSubmission";
import useSubmitContentAssignment from "@/hooks/queries/student/useSubmitContentAssignment";
import AssignmentSubmissionPanel from "@/components/student/assignments/AssignmentSubmissionPanel";

/**
 * The student view of a lesson-composer Assignment block — a Content row with
 * type ASSIGNMENT, which has no Assignment row behind it. Reuses the same
 * brief + reference material + PDF upload panel as a real Assignment, but
 * reads and writes the submission through /contents/:id instead of
 * /assignments/:id. The frame header already shows the title.
 */
export default function ContentAssignmentPanel({ contentId, instructions, attachments }) {
  const { data: submission, isLoading } = useContentSubmission(contentId);
  const submitMutation = useSubmitContentAssignment(contentId);

  if (isLoading) return <Loader />;

  return (
    <AssignmentSubmissionPanel
      assignment={{
        id: contentId,
        description: instructions,
        attachments,
        submission: submission || null,
      }}
      submitMutation={submitMutation}
      showTitle={false}
    />
  );
}
