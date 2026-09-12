"use client";

import { useRouter } from "next/navigation";

const ROW_ACCENTS = [
  { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

/** Compact clickable course row for the My Courses "Recently Viewed" list —
 *  same visual language as the student dashboard's ContinueLearningRow, but
 *  reads a course directly (instructor owns it) and opens the Composer. */
export default function RecentlyViewedCourseRow({ course, accentIdx }) {
  const router = useRouter();
  const totalLessons = course.stats?.lessonsCount ?? course._count?.lessons ?? 0;
  const accent = ROW_ACCENTS[accentIdx % ROW_ACCENTS.length];

  const goToCourse = () => router.push(`/instructor/courses/${course.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToCourse}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToCourse();
        }
      }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 transition cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 h-10 w-10 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center font-black text-sm`}>
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-h4 text-foreground truncate">{course.title || "Untitled Course"}</h4>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {totalLessons > 0 ? `${totalLessons} lesson${totalLessons === 1 ? "" : "s"}` : "Self-paced"}
          </p>
        </div>
      </div>
    </div>
  );
}
