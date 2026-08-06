"use client";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useLessons } from "@/hooks/queries/instructor/useLessons";

const selectClass =
  "w-full bg-[#0D1021] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#0D1021] [&>option]:text-slate-200";
const labelClass = "text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

/**
 * Inline Course -> Module -> Lesson cascading picker embedded directly in a
 * creation page — no separate "Apply" step; picking a course resets module
 * and lesson, picking a module resets lesson.
 */
export default function CourseModuleLessonSelect({ courseId, moduleId, lessonId, onChange }) {
  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();
  const { data: modules = [], isLoading: loadingModules } = useModules(courseId);
  const { data: lessons = [], isLoading: loadingLessons } = useLessons(moduleId);

  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#05070E] p-4 grid gap-3 sm:grid-cols-3">
      <div>
        <label className={labelClass}>Course</label>
        <select
          className={selectClass}
          value={courseId}
          onChange={(e) => onChange({ courseId: e.target.value, moduleId: "", lessonId: "" })}
          disabled={loadingCourses}
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Module</label>
        <select
          className={selectClass}
          value={moduleId}
          onChange={(e) => onChange({ courseId, moduleId: e.target.value, lessonId: "" })}
          disabled={!courseId || loadingModules}
        >
          <option value="">-- Select Module --</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Lesson</label>
        <select
          className={selectClass}
          value={lessonId}
          onChange={(e) => onChange({ courseId, moduleId, lessonId: e.target.value })}
          disabled={!moduleId || loadingLessons}
        >
          <option value="">-- Select Lesson --</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
