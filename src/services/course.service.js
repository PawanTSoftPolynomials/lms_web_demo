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
 * Batch Performance Overview — instructor Home dashboard widget.
 * Real, computed metrics only (completion/quiz/assignment/health); no
 * attendance-tracking feature exists in the schema, so attendanceRate
 * always comes back null and the widget renders "N/A" for it.
 */
export const getBatchPerformanceOverview = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.batchId) params.set("batchId", filters.batchId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.search) params.set("search", filters.search);

    const { data } = await api.get(`/courses/batches/overview?${params.toString()}`);
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
 * Get A Single Batch's Detail (course info + current student roster)
 */
export const getBatchById = async (batchId) => {
    const { data } = await api.get(`/courses/batches/${batchId}`);
    return data.data ?? data;
};

/**
 * Get Students Eligible To Be Added To This Batch — enrolled in the
 * batch's course, minus whoever is already a member.
 */
export const getEnrollableStudentsForBatch = async (batchId) => {
    const { data } = await api.get(`/courses/batches/${batchId}/enrollable-students`);
    return data.data ?? data;
};

/**
 * Add A Student To A Batch
 */
export const addStudentToBatch = async (batchId, studentId) => {
    const { data } = await api.post(`/courses/batches/${batchId}/students`, { studentId });
    return data.data ?? data;
};

/**
 * Remove A Student From A Batch
 */
export const removeStudentFromBatch = async (batchId, studentId) => {
    const { data } = await api.delete(`/courses/batches/${batchId}/students/${studentId}`);
    return data.data ?? data;
};

/**
 * Full Batch Detail Dashboard — overview, student summary, activity feed,
 * upcoming schedule, student list, and announcements, all real data.
 */
export const getBatchDetailDashboard = async (batchId) => {
    const { data } = await api.get(`/courses/batches/${batchId}/dashboard`);
    return data.data ?? data;
};

/**
 * Archive / Unarchive / Complete A Batch
 */
export const updateBatchStatus = async (batchId, status) => {
    const { data } = await api.patch(`/courses/batches/${batchId}/status`, { status });
    return data.data ?? data;
};

/**
 * Batch-Scoped Announcements
 */
export const getBatchAnnouncements = async (batchId) => {
    const { data } = await api.get(`/courses/batches/${batchId}/announcements`);
    return data.data ?? data;
};

export const createBatchAnnouncement = async (batchId, { title, message }) => {
    const { data } = await api.post(`/courses/batches/${batchId}/announcements`, { title, message });
    return data.data ?? data;
};

/**
 * Find-or-create the batch's group conversation (instructor + every
 * current batch student) and return it so the caller can navigate straight
 * into it.
 */
export const startBatchConversation = async (batchId) => {
    const { data } = await api.post(`/courses/batches/${batchId}/message`, {});
    return data.data ?? data;
};
