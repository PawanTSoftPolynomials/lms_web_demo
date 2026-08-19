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
 * Every published course for the student Store, with pricing included.
 * GET /courses defaults to limit=10 (pagination for the admin/instructor
 * table views) -- the Store needs the full catalog, so this requests a
 * generously high limit explicitly instead of reusing getCourses() above.
 */
export const getStoreCourses = async () => {
    const {data} = await api.get("/courses?limit=200&status=PUBLISHED&sortBy=newest");
    return data.data ?? data;
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
 * Validate Course For Publish
 */
export const validateCoursePublish = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/publish-validation`);
    return data.data ?? data;
};

/**
 * Publish Course
 */
export const publishCourse = async (courseId) => {
    const { data } = await api.post(`/courses/${courseId}/publish`);
    return data;
};

/**
 * Unpublish Course
 */
export const unpublishCourse = async (courseId) => {
    const { data } = await api.post(`/courses/${courseId}/unpublish`);
    return data;
};

/**
 * Archive Course
 */
export const archiveCourse = async (courseId) => {
    const { data } = await api.post(`/courses/${courseId}/archive`);
    return data;
};

/**
 * Restore Archived Course to DRAFT
 */
export const restoreCourse = async (courseId) => {
    const { data } = await api.post(`/courses/${courseId}/restore`);
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

/**
 * Get Batches For A Single Course
 */
export const getCourseBatches = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/batches`);
    return data.data ?? data;
};

/**
 * Get All Batches Across The Instructor's Courses (with optional filters)
 */
export const getMyBatches = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.status) params.set("status", filters.status);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    const { data } = await api.get(`/courses/batches/mine?${params.toString()}`);
    return data.data ?? data;
};

/**
 * Create A Batch For A Course
 */
export const createCourseBatch = async (courseId, batchData) => {
    const { data } = await api.post(`/courses/${courseId}/batches`, batchData);
    return data.data ?? data;
};

/**
 * Export Course ZIP package
 */
export const exportCourse = async (courseId) => {
    return api.get(`/courses/${courseId}/export`, {
        responseType: "blob"
    });
};
