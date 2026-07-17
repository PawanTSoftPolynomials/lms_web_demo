import api from "@/lib/axios";

/**
 * Enroll Course
 */
export const enrollCourse = async (
    courseId
) => {
    const {data} = await api.post(
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

    const {data} = await api.get(
        url
    );

    return data.data;
};

/**
 * Get My Enrollments
 */
/**
 * Get My Enrollments
 */
export const getMyEnrollments = async () => {
    const {data} = await api.get("/enrollments");

    return data.data ?? data;
};
/**
 * Unenroll Course
 */
export const unenrollCourse =
    async (enrollmentId) => {
        const {data} =
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
        const {data} =
            await api.delete(
                `/enrollments/${enrollmentId}`
            );

        return data;
    };

/**
 * Track Course Access — updates lastAccessedAt on the enrollment.
 * Fire-and-forget: call whenever a student opens the course player.
 */
export const trackCourseAccess = async (courseId) => {
    try {
        const { data } = await api.patch(`/enrollments/${courseId}/access`);
        return data;
    } catch {
        // Non-critical — silently ignore failures
    }
};