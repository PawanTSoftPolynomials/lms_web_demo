import api from "@/lib/axios";

/**
 * Get All Courses
 */
export const getCourses = async () => {
    const {data} = await api.get("/courses");

    return data.data;
};

/**
 * Get Course By ID
 */
export const getCourseById = async (
    courseId
) => {
    const {data} = await api.get(
        `/courses/${courseId}`
    );

    return data;
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
