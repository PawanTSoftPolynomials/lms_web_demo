"use client";

import { useMemo } from "react";

// Lesson list + position derivations for a course, plus the single entry
// point (selectLesson) every lesson-navigation control routes through.
export default function useLessonNavigation(course, selectedLesson, setSelectedLesson) {
  const lessons = useMemo(() => {
    const modules = course?.modules || [];
    return modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        duration: lesson.duration || "N/A",
      }))
    );
  }, [course]);

  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === selectedLesson?.id);
  }, [lessons, selectedLesson]);

  const previousLesson = useMemo(() => {
    return currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  }, [lessons, currentLessonIndex]);

  const nextLesson = useMemo(() => {
    return currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;
  }, [lessons, currentLessonIndex]);

  // Does finishing the current lesson cross into a new module?
  const nextModule = useMemo(() => {
    if (!nextLesson || !selectedLesson || nextLesson.moduleId === selectedLesson.moduleId) {
      return null;
    }
    return course?.modules?.find((m) => m.id === nextLesson.moduleId) || null;
  }, [nextLesson, selectedLesson, course]);

  const selectLesson = (lesson) => {
    if (!lesson) return;
    setSelectedLesson(lesson);
  };

  return {
    lessons,
    currentLessonIndex,
    previousLesson,
    nextLesson,
    nextModule,
    selectLesson,
  };
}
