"use client";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useLessons } from "@/hooks/queries/instructor/useLessons";
import { useTopics } from "@/hooks/queries/instructor/useTopics";

const selectClass =
  "w-full bg-card border border-border text-xs px-3 py-2.5 rounded-xl outline-none text-foreground focus:border-primary/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-card [&>option]:text-foreground";
const labelClass = "text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block";

/**
 * Inline Course -> Module -> Lesson (-> Topic) cascading picker embedded
 * directly in a creation page — no separate "Apply" step; picking a course
 * resets module/lesson/topic, picking a module resets lesson/topic, picking
 * a lesson resets topic. `includeTopic` opts in the Topic column for flows
 * that create Content (which now nests under Topic, not Lesson directly) —
 * lesson-scoped flows (e.g. Lesson Notes) can leave it off.
 */
export default function CourseModuleLessonSelect({ courseId, moduleId, lessonId, topicId, includeTopic = false, onChange }) {
  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();
  const { data: modules = [], isLoading: loadingModules } = useModules(courseId);
  const { data: lessons = [], isLoading: loadingLessons } = useLessons(moduleId);
  const { data: topics = [], isLoading: loadingTopics } = useTopics(includeTopic ? lessonId : undefined);

  return (
    <div className={`rounded-2xl border border-border bg-[#05070E] p-4 grid gap-3 ${includeTopic ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
      <div>
        <label className={labelClass}>Course</label>
        <select
          className={selectClass}
          value={courseId}
          onChange={(e) => onChange({ courseId: e.target.value, moduleId: "", lessonId: "", topicId: "" })}
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
          onChange={(e) => onChange({ courseId, moduleId: e.target.value, lessonId: "", topicId: "" })}
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
          onChange={(e) => onChange({ courseId, moduleId, lessonId: e.target.value, topicId: "" })}
          disabled={!moduleId || loadingLessons}
        >
          <option value="">-- Select Lesson --</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>
      {includeTopic && (
        <div>
          <label className={labelClass}>Topic</label>
          <select
            className={selectClass}
            value={topicId}
            onChange={(e) => onChange({ courseId, moduleId, lessonId, topicId: e.target.value })}
            disabled={!lessonId || loadingTopics}
          >
            <option value="">-- Select Topic --</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
