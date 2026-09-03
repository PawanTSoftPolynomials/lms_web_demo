"use client";

import Link from "next/link";
import { Star, BookOpen, Users, Trophy } from "lucide-react";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TopInstructor({ instructor, isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">Top Performing Instructor</h3>
        <Trophy size={14} className="text-amber-400" />
      </div>

      {!instructor ? (
        <p className="text-xs text-muted-foreground text-center py-8">No instructor data yet</p>
      ) : (
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-300 shrink-0">
              {initials(instructor.name) || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{instructor.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{instructor.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <BookOpen size={12} className="text-purple-400 mx-auto" />
              <p className="text-sm font-black text-foreground mt-1">{instructor.coursesCount}</p>
              <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Courses</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <Users size={12} className="text-emerald-400 mx-auto" />
              <p className="text-sm font-black text-foreground mt-1">{instructor.studentsCount}</p>
              <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Students</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <Star size={12} className="text-amber-400 mx-auto fill-amber-400" />
              <p className="text-sm font-black text-foreground mt-1">{instructor.avgRating > 0 ? instructor.avgRating : "—"}</p>
              <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Rating</p>
            </div>
          </div>

          <Link
            href="/admin/instructors"
            className="mt-4 block text-center text-[10px] font-bold text-primary hover:text-orange-300 border-t border-border pt-3"
          >
            View all instructors &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
