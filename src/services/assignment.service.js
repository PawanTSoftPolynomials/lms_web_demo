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
