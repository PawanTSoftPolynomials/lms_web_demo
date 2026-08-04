/** Client-side CSV export for the My Courses table — data is already fetched, no server round-trip needed. */
export function exportCoursesCsv(courses) {
  const headers = ["Title", "Category", "Level", "Status", "Creator", "Students", "Modules", "Lessons", "Last Updated"];
  const rows = courses.map((c) => [
    c.title,
    c.category || "",
    c.level || "",
    c.status,
    c.creator?.name || "",
    c._count?.enrollments ?? 0,
    c._count?.modules ?? 0,
    c.stats?.lessonsCount ?? 0,
    c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `my-courses-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
