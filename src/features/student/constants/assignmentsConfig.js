export const ASSIGNMENT_STATUSES = [
  "Not Submitted",
  "In Progress",
  "Submitted",
  "Graded",
];

export const normalizeAssignmentStatus = (assignment) =>
  assignment.status || assignment.submissionStatus || "Not Submitted";
