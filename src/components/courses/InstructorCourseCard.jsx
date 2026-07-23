"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Layers, MoreVertical, Pencil, Trash2 } from "lucide-react";

import DifficultyBadge from "./DifficultyBadge";
import CourseMetaItem from "./CourseMetaItem";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";

export default function InstructorCourseCard({ course }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const deleteCourseMutation = useDeleteCourse();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (!course) return null;

  const isPublished = course.status === "Published" || course.status === "PUBLISHED";
  const modulesCount = course.modules?.length ?? 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      try {
        await deleteCourseMutation.mutateAsync(course.id);
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  return (
    <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1.5 hover:border-slate-700/60 hover:shadow-2xl hover:shadow-slate-950/60 transition-all duration-400 flex flex-col justify-between min-h-[360px]">
      
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-orange-500 transition-colors duration-300 truncate">
              {course.title}
            </h3>
            {course.category && (
              <p className="text-xs font-semibold text-purple-400/80 tracking-wide uppercase">
                {course.category}
              </p>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown((prev) => !prev);
              }}
              className="text-slate-500 hover:text-white transition p-1.5 hover:bg-slate-800/60 rounded-lg shrink-0"
              title="Options"
            >
              <MoreVertical size={18} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-xl z-20 text-left">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push(`/instructor/courses/edit/${course.id}`);
                  }}
                  className="w-full flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteCourseMutation.isPending}
                  className="w-full flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-2 rounded-lg transition"
                >
                  <Trash2 size={14} />
                  <span>{deleteCourseMutation.isPending ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator Divider */}
        <div className="border-b border-slate-800/80 my-4" />

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {course.description || "Learn the concepts and build enterprise-grade applications with hands-on practice sessions."}
        </p>
      </div>

      {/* Bottom Stats Section */}
      <div className="mt-5">
        
        {/* Stats Row */}
        <div className="flex items-center gap-3">
          <DifficultyBadge level={course.level || "Intermediate"} />
          <span className="text-slate-750 font-normal">|</span>
          <CourseMetaItem icon={Layers} text={`${modulesCount} Modules`} />
        </div>

        {/* Status Indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span className={`h-2.5 w-2.5 rounded-full ${
            isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`} />
          <span className={isPublished ? "text-emerald-400" : "text-amber-400"}>
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

        {/* Action Button */}
        <Link
          href={`/instructor/courses/${course.id}`}
          className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-extrabold uppercase tracking-widest py-3.5 text-center transition-all duration-300 active:scale-[0.98] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25"
        >
          <Settings size={15} className="shrink-0 animate-[spin_5s_linear_infinite]" />
          <span>Manage Course</span>
        </Link>

      </div>
    </div>
  );
}
