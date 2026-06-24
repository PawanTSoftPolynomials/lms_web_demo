import api from "@/lib/axios";

export const enrollCourse =
  async (courseId) => {
    const response =
      await api.post(
        "/enrollments",
        {
          courseId,
        }
      );

    return response.data;
  };

export const getEnrollments =
  async (
    userId,
    courseId
  ) => {
    let url =
      "/enrollments";

    const params =
      new URLSearchParams();

    if (userId) {
      params.append(
        "userId",
        userId
      );
    }

    if (courseId) {
      params.append(
        "courseId",
        courseId
      );
    }

    if (
      params.toString()
    ) {
      url +=
        `?${params.toString()}`;
    }

    const response =
      await api.get(url);

    return response.data.data;
  };

export const getMyEnrollments =
  async (userId) => {
    const response =
      await api.get(
        `/enrollments?userId=${userId}`
      );

    return response.data.data;
  };

export const unenrollCourse =
  async (
    enrollmentId
  ) => {
    const response =
      await api.delete(
        `/enrollments/${enrollmentId}`
      );

    return response.data;
  };

export const deleteEnrollment =
  async (
    enrollmentId
  ) => {
    const response =
      await api.delete(
        `/enrollments/${enrollmentId}`
      );

    return response.data;
  };