import api from "@/lib/axios";

/**
 * Batches the logged-in student is a member of — the student counterpart of
 * the instructor's getMyBatches()/`/courses/batches/mine`, hitting the
 * parallel `/courses/batches/student/mine` endpoint added for read-only
 * student access.
 */
export const getMyBatches = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.courseId) params.set("courseId", filters.courseId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const { data } = await api.get(`/courses/batches/student/mine${query ? `?${query}` : ""}`);
  return data.data ?? data;
};

/** Same endpoints the instructor module already uses — read access is now
 * also granted to students who are members of the batch (see
 * verifyBatchAccess on the backend), so these are reused as-is. */
export const getBatchById = async (batchId) => {
  const { data } = await api.get(`/courses/batches/${batchId}`);
  return data.data ?? data;
};

export const getBatchDetailDashboard = async (batchId) => {
  const { data } = await api.get(`/courses/batches/${batchId}/dashboard`);
  return data.data ?? data;
};

export const getBatchAnnouncements = async (batchId) => {
  const { data } = await api.get(`/courses/batches/${batchId}/announcements`);
  return data.data ?? data;
};
