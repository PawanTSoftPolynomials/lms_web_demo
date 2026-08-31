"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Bookmark as BookmarkIcon } from "lucide-react";

export default function MobileContinueCard({ enrollment }) {
  const [bookmarked, setBookmarked] = useState(false);
  const course = enrollment.course || {};
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const lessonLabel = totalLessons > 0 ? `Lesson ${Math.min(completedLessons + 1, totalLessons)} of ${totalLessons}` : "Self-paced";

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base shrink-0">
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-h4 text-foreground truncate">{course.title || "Untitled Course"}</h3>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lessonLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setBookmarked((v) => !v)}
          title={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className={`shrink-0 h-9 w-9 rounded-full border flex items-center justify-center transition ${
            bookmarked
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-[#141930] border-border text-muted-foreground"
          }`}
        >
          <BookmarkIcon size={15} className={bookmarked ? "fill-orange-400" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3.5">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-black text-foreground shrink-0">{progress}%</span>
      </div>

      <Link
        href={`/student/learn/${enrollment.courseId || course.id}`}
        className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-xl bg-primary active:bg-orange-600 text-slate-950 font-black text-sm py-3 min-h-[44px] transition"
      >
        <Play size={15} className="fill-slate-950" /> Continue
      </Link>
    </div>
  );
}
