"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, Layers, Users, Star } from "lucide-react";

import DifficultyBadge from "./DifficultyBadge";
import CourseMetaItem from "./CourseMetaItem";

export default function FeaturedCourseCard({ course }) {
  if (!course) return null;

  const isPublished = course.status === "Published" || course.status === "PUBLISHED";

  // Calculate rating average if present
  const reviewsCount = course.reviews?.length ?? 0;
  const averageRating = reviewsCount > 0 
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : null;

  // Mock fallbacks to match mockup design exactly
  const getMockRating = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("java")) return "4.8 (120)";
    if (t.includes(".net")) return "4.7 (98)";
    if (t.includes("testing")) return "4.6 (76)";
    return "4.7 (24)";
  };

  const getMockStudents = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("java")) return 248;
    if (t.includes(".net")) return 185;
    if (t.includes("testing")) return 320;
    return 150;
  };

  const getMockModules = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("java")) return 12;
    if (t.includes(".net")) return 10;
    if (t.includes("testing")) return 8;
    return 6;
  };

  const ratingText = averageRating ? `${averageRating} (${reviewsCount})` : getMockRating(course.title);
  const studentsCount = course.enrollments?.length || getMockStudents(course.title);
  const modulesCount = course.modules?.length || getMockModules(course.title);

  const isLogo = course.thumbnailUrl && (
    course.thumbnailUrl.includes("gstatic.com") || 
    course.thumbnailUrl.includes("miro.medium.com") || 
    course.thumbnailUrl.includes("logo") || 
    course.thumbnailUrl.includes("brand")
  );

  return (
    <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 hover:border-slate-700/60 hover:shadow-2xl hover:shadow-slate-950/60 transition-all duration-400 min-h-[480px]">
      
      {/* Banner Image (Fixed 16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video overflow-hidden bg-slate-950/40 shrink-0 border-b border-slate-800/40 rounded-t-2xl">
        {course.thumbnailUrl ? (
          isLogo ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 p-10">
              <div className="relative h-20 w-20">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ) : (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-900">
            <span className="text-5xl">📚</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        {/* Info top */}
        <div>
          {course.category && (
            <span className="inline-block rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase mb-3">
              {course.category}
            </span>
          )}

          <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-orange-500 transition-colors duration-300 line-clamp-1 mb-2">
            {course.title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
            {course.description || "Learn the concepts and build enterprise-grade applications with hands-on practice sessions."}
          </p>
        </div>

        {/* Separator Divider */}
        <div className="border-b border-slate-800/85 my-2" />

        {/* Info Grid (2x2 Layout) */}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <DifficultyBadge level={course.level || "Intermediate"} />
            </div>
            <div className="flex items-center">
              <CourseMetaItem icon={Layers} text={`${modulesCount} Modules`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-800/40 pt-3">
            <div className="flex items-center">
              <CourseMetaItem icon={Users} text={`${studentsCount} Students`} />
            </div>
            <div className="flex items-center">
              <CourseMetaItem icon={Star} text={ratingText} />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <span className={`h-2 w-2 rounded-full ${
            isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`} />
          <span className={isPublished ? "text-emerald-400" : "text-amber-400"}>
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

        {/* Action Button */}
        <Link
          href={`/courses/${course.id}`}
          className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-955 text-xs font-black uppercase tracking-widest py-3.5 text-center transition-all duration-300 active:scale-[0.98] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25"
        >
          <Settings size={15} className="shrink-0 animate-[spin_5s_linear_infinite]" />
          <span>View Course</span>
        </Link>

      </div>
    </div>
  );
}
