"use client";

import { useRouter } from "next/navigation";

const ROW_ACCENTS = [
  { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

export default function ContinueLearningRow({ enrollment, accentIdx }) {
  const router = useRouter();
  const course = enrollment.course || {};
  const courseId = enrollment.courseId || course.id;
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const accent = ROW_ACCENTS[accentIdx % ROW_ACCENTS.length];

  const goToCourse = () => router.push(`/student/learn/${courseId}`);

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
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-border bg-[#0A0D1B] hover:border-primary/40 transition cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 h-10 w-10 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center font-black text-sm`}>
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-foreground truncate">{course.title || "Untitled Course"}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {totalLessons > 0 ? `${completedLessons}/${totalLessons} lessons` : "Self-paced"} &middot; {progress}% complete
          </p>
          <div className="w-full max-w-[220px] h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
