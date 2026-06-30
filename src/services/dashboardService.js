import api from "@/lib/axios";

export const getStudentDashboard = async () => {
  const response = await api.get("/dashboard/student");
  return response.data;
};