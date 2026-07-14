import api from "@/lib/axios";

export const getUpcomingTasks = async () => {
  const { data } = await api.get("/upcoming-tasks");
  return data.data ?? data;
};
