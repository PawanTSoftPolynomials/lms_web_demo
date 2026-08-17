"use client";

import { Check } from "lucide-react";

/**
 * Checkbox-list course picker — a batch can span multiple courses, so the
 * plain single `<select>` the old single-course model used doesn't work
 * here. Kept as a scrollable checkbox list rather than a native multi-select
 * since native multi-selects are unusable on most platforms.
 */
export default function CourseMultiSelect({ courses, selectedIds, onChange, disabledIds = [] }) {
  const toggle = (courseId) => {
    if (disabledIds.includes(courseId)) return;
    const next = selectedIds.includes(courseId)
      ? selectedIds.filter((id) => id !== courseId)
      : [...selectedIds, courseId];
    onChange(next);
  };

  if (courses.length === 0) {
    return <p className="text-xs text-slate-500 py-2">No courses available.</p>;
  }

  return (
    <div className="max-h-48 overflow-y-auto rounded-xl border border-[#1A1F35] bg-slate-950 divide-y divide-[#1A1F35]">
      {courses.map((course) => {
        const checked = selectedIds.includes(course.id);
        const disabled = disabledIds.includes(course.id);
        return (
          <label
            key={course.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs transition ${
              disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.03]"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                checked ? "bg-orange-500 border-orange-500" : "border-slate-700"
              }`}
            >
              {checked && <Check size={11} className="text-white" strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(course.id)}
            />
            <span className={`truncate ${checked ? "text-slate-100 font-bold" : "text-slate-300"}`}>
              {course.title}
            </span>
          </label>
        );
      })}
    </div>
  );
}
