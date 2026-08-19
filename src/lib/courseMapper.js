/**
 * Normalizes a course object from API (Student or Instructor) into a 5-layer
 * consistent hierarchy: Course -> Module -> Lesson -> Topic -> Content.
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
        };
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...lesson,
        order: typeof lesson.order === "number" ? lesson.order : lIdx + 1,
        topics,
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      ...mod,
      order: typeof mod.order === "number" ? mod.order : mIdx + 1,
      lessons,
    };
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    ...rawCourse,
    modules,
  };
}
