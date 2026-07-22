"use client";

import { BookOpen, ArrowRight, ChevronRight } from "lucide-react";

export default function CourseManagementPanel({ courseData, onOpenAction }) {
  const { attentionCount = 0, courses = [] } = courseData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Course Review Queue
              <span className="inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/30">
                {attentionCount} Require Action
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Pending reviews, missing instructors & content flags</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_courses", title: "Global Course Catalog Management" })}
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
        >
          Review Queue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Course List */}
      <div className="mt-3.5 flex-1 space-y-3 overflow-y-auto pr-1">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-orange-400 border border-slate-700">
                {course.status}
              </span>
              <h4 className="text-xs font-bold text-white mt-1.5">{course.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instructor: <span className="text-slate-300 font-semibold">{course.instructor}</span> • Enrolled: {course.students} students
              </p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "review_course", title: `Review Course: ${course.title}`, data: course })}
                className="flex items-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition"
              >
                <span>Open Course Review</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
