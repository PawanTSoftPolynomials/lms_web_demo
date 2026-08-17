/** Shared CSV download helper — data is already fetched, no server round-trip needed. */
function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Client-side CSV export of a single batch's performance report (from already-fetched overview data). */
export function exportBatchReportCsv(batch) {
  const headers = ["Metric", "Value"];
  const rows = [
    ["Batch Name", batch.name],
    ["Courses", (batch.courseTitles || []).join(", ")],
    ["Status", batch.status],
    ["Students", batch.studentsCount],
    ["Completion", `${batch.completion}%`],
    ["Avg Quiz Score", batch.avgQuizScore != null ? `${batch.avgQuizScore}%` : "N/A"],
    ["Assignment Submission Rate", batch.assignmentSubmissionRate != null ? `${batch.assignmentSubmissionRate}%` : "N/A"],
    ["Attendance", "N/A — not tracked"],
    ["Engagement", batch.engagementStatus],
    ["Started", batch.startDate ? new Date(batch.startDate).toLocaleDateString() : ""],
  ];
  downloadCsv(`${batch.name}-report-${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
}

/** Client-side CSV export of a batch's student roster (requires the full studentList from the batch dashboard). */
export function exportBatchStudentListCsv(batchName, studentList) {
  const headers = ["Name", "Email", "Progress", "Quiz Average", "Attendance", "Status"];
  const rows = studentList.map((s) => [
    s.name,
    s.email,
    `${s.progress}%`,
    s.quizAverage != null ? `${s.quizAverage}%` : "N/A",
    s.attendanceRate != null ? `${s.attendanceRate}%` : "N/A",
    s.status,
  ]);
  downloadCsv(`${batchName}-students-${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
}
