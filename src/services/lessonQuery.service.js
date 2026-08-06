import api from "@/lib/axios";

export const getLessonQueries = async (lessonId) => {
  const { data } = await api.get(`/lesson-queries?lessonId=${lessonId}`);
  return data.data;
};

export const createLessonQuery = async (payload) => {
  const { data } = await api.post("/lesson-queries", payload);
  return data.data;
};

export const replyToLessonQuery = async (queryId, reply) => {
  const { data } = await api.patch(`/lesson-queries/${queryId}/reply`, { reply });
  return data.data;
};

export const updateLessonQueryStatus = async (queryId, status) => {
  const { data } = await api.patch(`/lesson-queries/${queryId}/status`, { status });
  return data.data;
};

/** Doubts across every course the instructor owns, with optional filters. */
export const getMyLessonQueries = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const { data } = await api.get(`/lesson-queries/mine?${params.toString()}`);
  return data.data;
};
