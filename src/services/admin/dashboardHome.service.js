/**
 * Platform-wide course list -> the "Course Overview" table on the admin
 * home page.
 */
export function deriveCourseOverview(courses) {
  return (courses ?? []).map((c, idx) => ({
    id: c.id ?? `course-${idx}`,
    title: c.title ?? "Untitled Course",
    category: c.category ?? "General",
    level: c.level ?? "—",
    status: c.status ?? "DRAFT",
    students: c._count?.enrollments ?? 0,
  }));
}

/**
 * Published vs. draft split -> the "Course Status" donut chart.
 */
export function deriveCourseStatusPie(publishedCourses = 0, draftCourses = 0) {
  return [
    { name: "Published", value: publishedCourses, color: "#f97316" },
    { name: "Draft", value: draftCourses, color: "#38bdf8" },
  ];
}

function daysAgoLabel(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Merges enrollments and certificate issuances into a single recency-sorted
 * timeline for the "Recent Activity" feed. Only sources the admin can
 * genuinely see platform-wide are included here — e.g. quiz completions are
 * left out because that endpoint is instructor-scoped, not admin-wide.
 */
export function deriveRecentActivity(enrollments, certificates) {
  const enrollmentEvents = (enrollments ?? []).map((e, idx) => ({
    id: `enrollment-${e.id ?? idx}`,
    type: "enrollment",
    title: `${e.student?.user?.name ?? "A student"} enrolled in ${e.course?.title ?? "a course"}`,
    at: e.enrolledAt ? new Date(e.enrolledAt) : null,
  }));

  const certificateEvents = (certificates ?? []).map((c, idx) => ({
    id: `certificate-${c.id ?? idx}`,
    type: "certificate",
    title: `Certificate issued to ${c.student?.user?.name ?? "a student"} for ${c.course?.title ?? "a course"}`,
    at: c.issuedAt ? new Date(c.issuedAt) : null,
  }));

  return [...enrollmentEvents, ...certificateEvents]
    .filter((event) => event.at)
    .sort((a, b) => b.at - a.at)
    .slice(0, 8)
    .map((event) => ({ ...event, time: daysAgoLabel(event.at) }));
}
