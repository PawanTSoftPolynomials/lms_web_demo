import api from "@/lib/axios";

export const getStudentProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const getStudents = async () => {
  const response = await api.get("/students");
  return response.data;
};

export const getStudentById = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
};

export const updateStudent = async (studentId, data) => {
  const response = await api.put(`/students/${studentId}`, data);
  return response.data;
};

export const getStudentProgress = async (studentId) => {
  const response = await api.get(`/students/${studentId}/progress`);
  return response.data;
};