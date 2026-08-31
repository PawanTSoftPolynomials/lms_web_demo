"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Bookmark as BookmarkIcon } from "lucide-react";

const ROW_ACCENTS = [
  { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

export default function ContinueLearningRow({ enrollment, accentIdx }) {
  const [bookmarked, setBookmarked] = useState(false);
  const course = enrollment.course || {};
  const courseId = enrollment.courseId || course.id;
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const accent = ROW_ACCENTS[accentIdx % ROW_ACCENTS.length];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-border bg-[#0A0D1B] hover:border-transparent transition">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 h-10 w-10 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center font-black text-sm`}>
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-h4 text-foreground truncate">{course.title || "Untitled Course"}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {totalLessons > 0 ? `${completedLessons}/${totalLessons} lessons` : "Self-paced"} &middot; {progress}% complete
          </p>
          <div className="w-full max-w-[220px] h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <Link href={`/student/learn/${enrollment.courseId || course.id}`} className="flex-1 sm:flex-none">
          <button className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-primary hover:bg-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer">
            <Play size={12} className="fill-slate-950" /> Continue
          </button>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((v) => !v);
          }}
          title={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
            bookmarked
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookmarkIcon size={14} className={bookmarked ? "fill-orange-400" : ""} />
        </button>
      </div>
    </div>
  );
}
