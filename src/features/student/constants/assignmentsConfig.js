export const ASSIGNMENT_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "upcoming" },
  { label: "Submitted", value: "Submitted" },
  { label: "Graded", value: "Graded" },
];

export const ASSIGNMENT_STATUSES = [
  "Not Submitted",
  "In Progress",
  "Submitted",
  "Graded",
];

export const normalizeAssignmentStatus = (assignment) =>
  assignment.status || assignment.submissionStatus || "Not Submitted";

export const ASSIGNMENT_QUICK_TIPS = [
  "Review the assignment instructions carefully.",
  "Track due dates and prioritize upcoming work.",
  "Submit before the deadline for full credit.",
  "Keep your files and answers organized.",
];
