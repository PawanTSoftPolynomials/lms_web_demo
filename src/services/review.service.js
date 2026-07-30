import api from "@/lib/axios";

export const getCourseReviews = async (courseId) => {
  const { data } = await api.get(`/reviews?courseId=${courseId}`);
  return data.data;
};

export const getCourseReviewStats = async (courseId) => {
  const { data } = await api.get(`/reviews/course/${courseId}/stats`);
  return data.data;
};
