/**
 * Normalizes a course object from API (Student or Instructor) into a 5-layer
 * consistent hierarchy: Course -> Module -> Lesson -> Topic -> Content.
 *
 * Also narrows each level's `quizzes` down to the ones actually scoped
 * there. Some Quiz rows carry every ancestor's foreign key at once
 * (courseId + moduleId + lessonId + topicId all set, instead of just the
 * one they were created under) — a known data issue, not something this
 * function can fix at the source, but left unfiltered it makes the same
 * quiz appear at Course, Module, Lesson, *and* Topic level simultaneously.
 * Mirrors the narrowing the instructor Course page already does inline
 * (`effectiveCourseQuizzes`/`effectiveModules` in
 * app/instructor/courses/[courseId]/page.jsx) so both sides agree on
 * where a quiz actually belongs.
 *
 * @param {Object} rawCourse Course entity from API
 * @returns {Object} Normalized course object
 */
export function normalizeCourseHierarchy(rawCourse) {
  if (!rawCourse) return null;

  const rawModules = rawCourse.modules || [];

  const modules = rawModules.map((mod, mIdx) => {
    const rawLessons = mod.lessons || [];

    const lessons = rawLessons.map((lesson, lIdx) => {
      const rawTopics = lesson.topics || [];

      const topics = rawTopics.map((topic, tIdx) => {
        const contents = (topic.contents || []).sort((a, b) => (a.order || 0) - (b.order || 0));

        return {
          ...topic,
          order: typeof topic.order === "number" ? topic.order : tIdx + 1,
          contents,
          quizzes: topic.quizzes || [],
        };
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...lesson,
        order: typeof lesson.order === "number" ? lesson.order : lIdx + 1,
        topics,
        quizzes: (lesson.quizzes || []).filter((q) => !q.topicId),
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      ...mod,
      order: typeof mod.order === "number" ? mod.order : mIdx + 1,
      lessons,
      quizzes: (mod.quizzes || []).filter((q) => !q.lessonId && !q.topicId),
    };
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    ...rawCourse,
    modules,
    quizzes: (rawCourse.quizzes || []).filter((q) => !q.moduleId && !q.lessonId && !q.topicId),
  };
}
