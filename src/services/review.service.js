import api from "@/lib/axios";

export const getCourseReviews = async (courseId) => {
  const { data } = await api.get(`/reviews?courseId=${courseId}`);
  return data.data;
};

export const getCourseReviewStats = async (courseId) => {
  const { data } = await api.get(`/reviews/course/${courseId}/stats`);
  return data.data;
};

/** Reviews across every course the instructor owns, with summary stats. */
export const getMyReviews = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const { data } = await api.get(`/reviews/mine?${params.toString()}`);
  return data.data;
};
