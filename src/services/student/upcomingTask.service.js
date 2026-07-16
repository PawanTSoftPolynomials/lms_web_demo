import api from "@/lib/axios";

/**
 * Get Student Upcoming Tasks
 */
export const getUpcomingTasks = async () => {
  const { data } = await api.get("/student/dashboard/upcoming-tasks");
  return data.data ?? data;
};
