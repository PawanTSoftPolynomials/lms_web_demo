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
