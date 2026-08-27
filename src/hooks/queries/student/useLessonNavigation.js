"use client";

import { useMemo } from "react";
import { useToast } from "@/components/ui/ToastProvider";

// Lesson list + progress/position derivations for a course, plus the single
// gated entry point (selectLesson) every lesson-navigation control routes
// through so a locked (drip-content) lesson can never become selected.
export default function useLessonNavigation(course, selectedLesson, setSelectedLesson) {
  const { showToast } = useToast();

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

  const completedLessonIds = useMemo(
    () => lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id),
    [lessons]
  );

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
    if (lesson.locked) {
      showToast("Complete the previous lesson to unlock this one.", "info");
      return;
    }
    setSelectedLesson(lesson);
  };

  return {
    lessons,
    completedLessonIds,
    currentLessonIndex,
    previousLesson,
    nextLesson,
    nextModule,
    selectLesson,
  };
}
