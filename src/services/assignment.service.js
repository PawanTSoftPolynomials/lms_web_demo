import api from "@/lib/axios";

export const getAssignments = async (params = {}) => {
  const { data } = await api.get("/assignments", { params });
  return data.data ?? data;
};

export const getAssignmentById = async (assignmentId) => {
  const { data } = await api.get(`/assignments/${assignmentId}`);
  return data.data ?? data;
};

export const submitAssignment = async (
  assignmentId,
  submissionData = {}
) => {
  const { data } = await api.post(
    `/assignments/${assignmentId}/submit`,
    submissionData
  );
  return data.data ?? data;
};

/** Instructor-side assignment ("Assessment") CRUD — courseId is optional (all courses if omitted). */
export const getInstructorAssignments = async (courseId) => {
  const url = courseId ? `/assignments?courseId=${courseId}` : "/assignments";
  const { data } = await api.get(url);
  return data.data ?? data;
};

export const createAssignment = async (payload) => {
  const { data } = await api.post("/assignments", payload);
  return data.data ?? data;
};

export const updateAssignment = async (assignmentId, payload) => {
  const { data } = await api.put(`/assignments/${assignmentId}`, payload);
  return data.data ?? data;
};

export const deleteAssignment = async (assignmentId) => {
  const { data } = await api.delete(`/assignments/${assignmentId}`);
  return data;
};
