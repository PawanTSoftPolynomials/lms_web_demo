import api from "@/lib/axios";

/**
 * Get Student Dashboard
 */
export const getStudentDashboard = async () => {
  const { data } = await api.get("/dashboard/student");
  return data.data ?? data;
};

/**
 * Get Student Profile
 */
export const getStudentProfile = async () => {
  try {
    const { data } = await api.get("/users/profile/me");
    return data.data ?? data;
  } catch (error) {
    const { data } = await api.get("/auth/profile");
    return data.data ?? data;
  }
};

/**
 * Get Student Progress
 */
export const getStudentProgress = async () => {
  try {
    const { data } = await api.get("/progress");
    return data.data ?? data;
  } catch (error) {
    return getStudentDashboard();
  }
};

/**
 * Get Student Certificates
 */
export const getStudentCertificates = async () => {
  const { data } = await api.get("/certificates");
  return data.data ?? data;
};

/**
 * Get All Students
 */
export const getStudents = async () => {
  const { data } = await api.get("/students");
  return data.data ?? data;
};

/**
 * Get Student By ID
 */
export const getStudentById = async (studentId) => {
  const { data } = await api.get(`/students/${studentId}`);
  return data.data ?? data;
};

/**
 * Update Student
 */
export const updateStudent = async (studentId, studentData) => {
  const { data } = await api.put(`/students/${studentId}`, studentData);
  return data;
};