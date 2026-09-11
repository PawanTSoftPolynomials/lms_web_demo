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

// Restores the student's place in a course on load (URL ?lessonId, then
// wherever the visited/completed Progress roll-up says to resume, then the
// first lesson) and persists it back to the DB (debounced) as the student
// watches. Owns the selectedLesson/timestamp state so restore and persist
// stay in lockstep instead of drifting apart.
//
// `resumeTarget` is resolveResumeTarget's output, computed once by the Learn
// page (it needs the same value for its own topic/content-level positioning
// afterward — see there) rather than recomputed here from raw progressData.
export default function useLearningStateSync({
  courseId,
  course,
  isLoading,
  stateData,
  isStateLoading,
  updateStateMutation,
  resumeTarget,
  isProgressLoading,
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

    // No explicit lesson requested — wait for the Progress roll-up to settle
    // (loaded or failed) before picking a default, so a plain Continue
    // Learning visit doesn't flash Lesson 1 before snapping to the real
    // resume point a moment later. Once settled, resumeTarget (not the old
    // DB-saved lessonId) decides which lesson to land on; the DB-saved
    // timestamp is still used, but only when it's for that same lesson,
    // purely to restore video playback position within it.
    if (isProgressLoading) return;

    const matchedLesson = resumeTarget?.lessonId
      ? lessons.find((l) => l.id === resumeTarget.lessonId)
      : null;

    if (matchedLesson) {
      setSelectedLesson(matchedLesson);
      const savedState = stateData?.data || stateData;
      if (savedState?.lessonId === resumeTarget.lessonId && savedState?.timestamp) {
        setInitialTime(savedState.timestamp);
        setCurrentTimestamp(savedState.timestamp);
      }
      setStateRestored(true);
      return;
    }

    // A resolved target with no lessonId (a Module/Course-level Content or
    // Quiz) has no lesson here to select — the Learn page's own resume
    // effect (which has courseUnits/enterUnit) positions the player exactly
    // once this settles on some lesson. Same fallback when progress is
    // unavailable or the course has nothing trackable yet.
    if (!selectedLesson && lessons.length > 0) {
      setSelectedLesson(lessons[0]);
      setStateRestored(true);
    }
  }, [
    lessons,
    selectedLesson,
    stateData,
    isStateLoading,
    isLoading,
    isProgressLoading,
    resumeTarget,
    courseId,
    stateRestored,
  ]);

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
