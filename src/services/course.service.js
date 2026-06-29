import api from "@/lib/axios";

/* ---------------- Get All Courses ---------------- */

export const getCourses = async () => {
  const response = await api.get("/courses");
  return response.data.data;
};

/* ---------------- Get Course By ID ---------------- */

export const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

/* ---------------- Create Course ---------------- */

export const createCourse = async (data) => {
  const response = await api.post("/courses", data);
  return response.data.data;
};

/* ---------------- Update Course ---------------- */

export const updateCourse = async (courseId, data) => {
  const response = await api.put(`/courses/${courseId}`, data);
  return response.data.data;
};

/* ---------------- Delete Course ---------------- */

export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data.data;
};

/* ---------------- Update Course Status ---------------- */

export const updateCourseStatus = async (courseId, status) => {
  const response = await api.patch(
    `/courses/${courseId}/status`,
    { status }
  );

  return response.data.data;
};