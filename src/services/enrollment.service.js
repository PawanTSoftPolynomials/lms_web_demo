import api from "@/lib/axios";

/**
 * Enroll Course
 */
export const enrollCourse = async (
    courseId
) => {
  const { data } = await api.post(
      "/enrollments",
      {
        courseId,
      }
  );

  return data;
};

/**
 * Get All Enrollments
 */
export const getEnrollments = async (
    userId,
    courseId
) => {
  let url = "/enrollments";

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

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const { data } = await api.get(
      url
  );

  return data.data;
};

/**
 * Get My Enrollments
 */
export const getMyEnrollments =
    async (userId) => {
      const url = userId
        ? `/enrollments?userId=${userId}`
        : "/enrollments";

      const { data } = await api.get(url);

      return data.data ?? data;
    };

/**
 * Unenroll Course
 */
export const unenrollCourse =
    async (enrollmentId) => {
      const { data } =
          await api.delete(
              `/enrollments/${enrollmentId}`
          );

      return data;
    };

/**
 * Delete Enrollment
 */
export const deleteEnrollment =
    async (enrollmentId) => {
      const { data } =
          await api.delete(
              `/enrollments/${enrollmentId}`
          );

      return data;
    };