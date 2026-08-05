import api from "@/lib/axios";

/**
 * Get All Courses
 */
export const getCourses = async () => {
    try {
        const {data} = await api.get("/courses");
        return data.data ?? data;
    } catch (error) {
        throw error;
    }
};

/** Real status-breakdown counts (total/published/draft/archived) for the My Courses summary cards. */
export const getCourseStatusCounts = async () => {
    const { data } = await api.get("/courses/stats/mine");
    return data.data ?? data;
};

/**
 * Get instructor's courses for the My Courses table/grid — server-side
 * search, filter, sort, and pagination. Kept separate from getCourses()
 * above since that function is used everywhere expecting a flat unpaginated
 * array; this one returns { courses, pagination } for this page only.
 */
export const getInstructorCoursesTable = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, value);
        }
    });

    const { data } = await api.get(`/courses?${params.toString()}`);
    return {
        courses: data.data ?? [],
        pagination: data.pagination ?? { page: 1, limit: 10, total: data.data?.length ?? 0, totalPages: 1 },
    };
};

/**
 * Get Course By ID
 */
export const getCourseById = async (
    courseId
) => {
    try {
        const { data } = await api.get(
            `/courses/${courseId}`
        );
        return data.data ?? data;
    } catch (error) {
        throw error;
    }
};

/**
 * Create Course
 */
export const createCourse = async (
    courseData
) => {
    const {data} = await api.post(
        "/courses",
        courseData
    );

    return data;
};

/**
 * Update Course
 */
export const updateCourse = async (
    courseId,
    courseData
) => {
    const {data} = await api.put(
        `/courses/${courseId}`,
        courseData
    );

    return data;
};

/**
 * Delete Course
 */
export const deleteCourse = async (
    courseId
) => {
    const {data} = await api.delete(
        `/courses/${courseId}`
    );

    return data;
};

/**
 * Update Course Status
 */
export const updateCourseStatus = async (
    courseId,
    status
) => {
    const {data} = await api.patch(
        `/courses/${courseId}/status`,
        {status}
    );

    return data;
};

/**
 * Duplicate Course
 */
export const duplicateCourse = async (
    courseId
) => {
    const {data} = await api.post(
        `/courses/${courseId}/duplicate`
    );

    return data;
};

/**
 * Get Students Enrolled In A Course (with real per-student progress/avgGrade)
 */
export const getCourseStudents = async (
    courseId
) => {
    const {data} = await api.get(
        `/courses/${courseId}/students`
    );

    return data.data ?? data;
};

// Batch-related API calls live in @/services/batch.service — a batch can
// span multiple courses now, so it's no longer nested under /courses.
