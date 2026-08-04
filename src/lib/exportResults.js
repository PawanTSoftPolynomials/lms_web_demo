/** Client-side CSV/PDF export for the Results page — no server round-trip needed since the data is already fetched. */

export function exportResultsCsv(studentResults, filenamePrefix = "results") {
  const headers = ["Student", "Type", "Title", "Score", "Total Marks", "Percentage", "Passed", "Submitted At"];
  const rows = studentResults.map((r) => [
    r.studentName,
    r.type,
    r.title,
    r.score,
    r.totalMarks,
    `${r.percentage}%`,
    r.passed ? "Yes" : "No",
    r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportResultsPdf(summary, studentResults, filenamePrefix = "results") {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Student Results", 14, 16);

  doc.setFontSize(10);
  const summaryLines = [
    `Average Score: ${summary.avgScore}%`,
    `Highest Score: ${summary.highestScore}%`,
    `Lowest Score: ${summary.lowestScore}%`,
    `Pass Rate: ${summary.passPercentage}%`,
    `Completion Rate: ${summary.completionRate}%`,
    `Pending Evaluations: ${summary.pendingEvaluations}`,
  ];
  doc.text(summaryLines.join("   |   "), 14, 24, { maxWidth: 180 });

  autoTable(doc, {
    startY: 32,
    head: [["Student", "Type", "Title", "Score", "Percentage", "Passed"]],
    body: studentResults.map((r) => [
      r.studentName,
      r.type,
      r.title,
      `${r.score}/${r.totalMarks}`,
      `${r.percentage}%`,
      r.passed ? "Yes" : "No",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [249, 115, 22] },
  });

  doc.save(`${filenamePrefix}-${new Date().toISOString().split("T")[0]}.pdf`);
}
