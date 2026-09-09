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
 * Fetch detailed progress for a course (Student or Instructor viewing a student)
 */
export const getCourseProgress = async (courseId, studentId = null) => {
  const url = studentId ? `/progress/courses/${courseId}?studentId=${studentId}` : `/progress/courses/${courseId}`;
  const { data } = await api.get(url);
  return data.data ?? data;
};

/**
 * Fetch overall progress across enrolled courses (Student or Instructor viewing a student)
 */
export const getOverallProgress = async (studentId = null) => {
  const url = studentId ? `/progress?studentId=${studentId}` : "/progress";
  const { data } = await api.get(url);
  return data.data ?? data;
};

/**
 * Fetch read-only course progress analytics for Instructors
 */
export const getInstructorCourseProgress = async (courseId) => {
  const { data } = await api.get(`/progress/instructor/courses/${courseId}`);
  return data.data ?? data;
};
