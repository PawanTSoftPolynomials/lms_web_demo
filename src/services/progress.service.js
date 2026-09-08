import api from "@/lib/axios";

/**
 * Mark a content item as complete or incomplete
 */
export const markContentComplete = async (contentId, completed = true) => {
  const { data } = await api.post("/progress/content-complete", {
    contentId,
    completed
  });
  return data.data ?? data;
};

/**
 * Mark a lesson (and all its topic contents) as complete or incomplete
 */
export const completeLesson = async (lessonId, completed = true) => {
  const { data } = await api.post("/progress/complete", {
    lessonId,
    completed
  });
  return data.data ?? data;
};

/**
 * Fetch detailed progress for a course (Student)
 */
export const getCourseProgress = async (courseId) => {
  const { data } = await api.get(`/progress/courses/${courseId}`);
  return data.data ?? data;
};

/**
 * Fetch overall progress across enrolled courses (Student)
 */
export const getOverallProgress = async () => {
  const { data } = await api.get("/progress");
  return data.data ?? data;
};

/**
 * Fetch read-only course progress analytics for Instructors
 */
export const getInstructorCourseProgress = async (courseId) => {
  const { data } = await api.get(`/progress/instructor/courses/${courseId}`);
  return data.data ?? data;
};
