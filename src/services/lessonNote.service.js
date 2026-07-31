import api from "@/lib/axios";

export const getLessonNotes = async (lessonId) => {
  const { data } = await api.get(`/lesson-notes?lessonId=${lessonId}`);
  return data.data;
};

export const createLessonNote = async (payload) => {
  const { data } = await api.post("/lesson-notes", payload);
  return data.data;
};

export const updateLessonNote = async (noteId, payload) => {
  const { data } = await api.put(`/lesson-notes/${noteId}`, payload);
  return data.data;
};

export const deleteLessonNote = async (noteId) => {
  await api.delete(`/lesson-notes/${noteId}`);
};
