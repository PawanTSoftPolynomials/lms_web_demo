import api from "@/lib/axios";

/**
 * Get Admin Dashboard
 */
export const getAdminDashboard = async () => {
  const { data } = await api.get(
    "/dashboard/admin"
  );

  return data.data;
};

/**
 * Get Instructor Dashboard
 */
export const getInstructorDashboard =
  async () => {
    const { data } = await api.get(
      "/dashboard/instructor"
    );

    return data.data;
  };

/**
 * Get Student Dashboard
 */
export const getStudentDashboard = async () => {
  const response = await api.get("/dashboard/student");
  return response.data;
};