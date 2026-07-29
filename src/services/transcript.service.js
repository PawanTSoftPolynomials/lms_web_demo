import api from "@/lib/axios";

const BASE = "/lessons";

export const getLessonTranscript = async (lessonId) => {
  const { data } = await api.get(`${BASE}/${lessonId}/transcript`);
  return data.data;
};
