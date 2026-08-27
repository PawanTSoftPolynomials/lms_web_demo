"use client";

import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

export default function RecommendedCourseCard({ course }) {
  const isNew = course.createdAt && Date.now() - new Date(course.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14;
  const hasReviews = Array.isArray(course.reviews) && course.reviews.length > 0;
  const rating = hasReviews
    ? (course.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / course.reviews.length).toFixed(1)
    : "4.8";

  return (
    <div className="group rounded-xl border border-[#1A1F35] bg-[#0A0D1B] p-2.5 hover:border-orange-500/40 transition-all flex flex-col gap-1 min-w-0">
      <Link href={`/student/courses/${course.id}`} className="block">
        <div className="flex items-start justify-between gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
            <BookOpen size={11} />
          </div>
          {isNew && (
            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 shrink-0">
              New
            </span>
          )}
        </div>
        <h4 className="text-xs font-extrabold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors mt-1">
          {course.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-1">
          <span className="truncate">{course.level || "Beginner"}</span>
          <span className="flex items-center gap-1 text-amber-400 shrink-0">
            <Star size={10} className="fill-amber-400" /> {rating}
          </span>
        </div>
      </Link>

      <Link
        href={`/student/courses/${course.id}`}
        className="mt-2 w-full py-1.5 px-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase tracking-wider transition cursor-pointer text-center"
      >
        View Course
      </Link>
    </div>
  );
}
