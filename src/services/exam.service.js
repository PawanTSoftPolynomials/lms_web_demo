import api from "@/lib/axios";

export const getExams = async (courseId) => {
  const url = courseId ? `/exams?courseId=${courseId}` : "/exams";
  const { data } = await api.get(url);
  return data.data ?? data;
};

export const getExamById = async (examId) => {
  const { data } = await api.get(`/exams/${examId}`);
  return data.data ?? data;
};

export const createExam = async (examData) => {
  const { data } = await api.post("/exams", examData);
  return data.data ?? data;
};

export const updateExam = async (examId, examData) => {
  const { data } = await api.put(`/exams/${examId}`, examData);
  return data.data ?? data;
};

export const deleteExam = async (examId) => {
  const { data } = await api.delete(`/exams/${examId}`);
  return data;
};
