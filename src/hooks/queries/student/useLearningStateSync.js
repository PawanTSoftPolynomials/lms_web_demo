"use client";

import { useEffect, useMemo, useState } from "react";

// Flattens the course's modules -> lessons into the single ordered list this
// hook restores/persists against. Kept local (rather than shared with
// useLessonNavigation) so this hook stays self-contained and doesn't need
// selectedLesson/setSelectedLesson threaded in from outside just to read the
// course structure.
function flattenLessons(course) {
  const modules = course?.modules || [];
  return modules.flatMap((module) =>
    (module.lessons || []).map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      duration: lesson.duration || "N/A",
    }))
  );
}

// Restores the student's place in a course on load (URL ?lessonId, then the
// last DB-saved position, then the first lesson) and persists it back to the
// DB (debounced) as the student watches. Owns the selectedLesson/timestamp
// state so restore and persist stay in lockstep instead of drifting apart.
export default function useLearningStateSync({
  courseId,
  course,
  isLoading,
  stateData,
  isStateLoading,
  updateStateMutation,
}) {
  const lessons = useMemo(() => flattenLessons(course), [course]);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [stateRestored, setStateRestored] = useState(false);

  // Restore state from DB on load
  useEffect(() => {
    if (isStateLoading || isLoading || stateRestored) return;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLessonId = urlParams.get("lessonId");
      if (queryLessonId) {
        const matchedLesson = lessons.find((l) => l.id === queryLessonId);
        if (matchedLesson) {
          setSelectedLesson(matchedLesson);
          setStateRestored(true);
          return;
        }
      }
    }

    const savedState = stateData?.data || stateData;
    if (savedState && savedState.courseId === courseId && savedState.lessonId) {
      const matchedLesson = lessons.find((l) => l.id === savedState.lessonId);
      if (matchedLesson) {
        setSelectedLesson(matchedLesson);
        if (savedState.timestamp) {
          setInitialTime(savedState.timestamp);
          setCurrentTimestamp(savedState.timestamp);
        }
        setStateRestored(true);
        return;
      }
    }

    if (!selectedLesson && lessons.length > 0) {
      setSelectedLesson(lessons[0]);
      setStateRestored(true);
    }
  }, [lessons, selectedLesson, stateData, isStateLoading, isLoading, courseId, stateRestored]);

  useEffect(() => {
    if (stateRestored) {
      setInitialTime(0);
    }
  }, [selectedLesson, stateRestored]);

  // Content now nests under Topic (Lesson -> Topic -> Content); only the
  // first content id is needed here (it's what the saved state points at).
  const firstContentId = useMemo(() => {
    const contents = (selectedLesson?.topics || []).flatMap((topic) => topic.contents || []);
    return contents?.[0]?.id || null;
  }, [selectedLesson]);

  // Sync state back to DB on change (debounced)
  useEffect(() => {
    if (!selectedLesson?.id || !stateRestored) return;

    const timer = setTimeout(() => {
      updateStateMutation.mutate({
        courseId,
        moduleId: selectedLesson.moduleId || null,
        lessonId: selectedLesson.id,
        contentId: firstContentId,
        timestamp: currentTimestamp,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedLesson, firstContentId, currentTimestamp, courseId, stateRestored]);

  return {
    selectedLesson,
    setSelectedLesson,
    currentTimestamp,
    setCurrentTimestamp,
    initialTime,
    stateRestored,
  };
}
