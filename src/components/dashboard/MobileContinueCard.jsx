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
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-base shrink-0">
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-white truncate">{course.title || "Untitled Course"}</h3>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{lessonLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setBookmarked((v) => !v)}
          title={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className={`shrink-0 h-9 w-9 rounded-full border flex items-center justify-center transition ${
            bookmarked
              ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
              : "bg-[#141930] border-[#1A1F35] text-slate-500"
          }`}
        >
          <BookmarkIcon size={15} className={bookmarked ? "fill-orange-400" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3.5">
        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-black text-white shrink-0">{progress}%</span>
      </div>

      <Link
        href={`/student/learn/${enrollment.courseId || course.id}`}
        className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 active:bg-orange-600 text-slate-950 font-black text-sm py-3 min-h-[44px] transition"
      >
        <Play size={15} className="fill-slate-950" /> Continue
      </Link>
    </div>
  );
}
