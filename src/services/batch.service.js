import api from "@/lib/axios";

/**
 * Batches (student cohorts). A batch can now span multiple courses, so every
 * function here talks to the dedicated /batches API rather than nesting under
 * /courses/:courseId like the old single-course-per-batch model did.
 */

/**
 * List batches, optionally scoped by course/status/date-range/search. Powers
 * both "all batches for this course" (pass courseId) and the general
 * instructor batch list (no courseId).
 */
export const listBatches = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.status) params.set("status", filters.status);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.search) params.set("search", filters.search);

    const { data } = await api.get(`/batches?${params.toString()}`);
    return data.data ?? data;
};

/**
 * Batch Performance Overview — instructor Home dashboard widget and the
 * Batches page's stat cards. Real, computed metrics only (completion/quiz/
 * assignment/health), pooled across every course linked to each batch; no
 * attendance-tracking feature exists in the schema, so attendanceRate always
 * comes back null and the UI renders "N/A" for it.
 */
export const getBatchPerformanceOverview = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.set("courseId", filters.courseId);
    if (filters.batchId) params.set("batchId", filters.batchId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.search) params.set("search", filters.search);

    const { data } = await api.get(`/batches/overview?${params.toString()}`);
    return data.data ?? data;
};

/**
 * Create a batch. `data.courseIds` must contain at least one course id —
 * a batch always belongs to one-or-more courses, never zero.
 */
export const createBatch = async (data) => {
    const { data: res } = await api.post("/batches", data);
    return res.data ?? res;
};

/**
 * Get a single batch's detail (linked courses + current student roster).
 */
export const getBatchById = async (batchId) => {
    const { data } = await api.get(`/batches/${batchId}`);
    return data.data ?? data;
};

/**
 * Update a batch's own fields (name/dates/etc). Pass `courseIds` to replace
 * the full set of linked courses in one call — for adding/removing a single
 * course, prefer addCourseToBatch/removeCourseFromBatch instead.
 */
export const updateBatch = async (batchId, data) => {
    const { data: res } = await api.patch(`/batches/${batchId}`, data);
    return res.data ?? res;
};

/**
 * Archive / Unarchive / Complete a batch.
 */
export const updateBatchStatus = async (batchId, status) => {
    const { data } = await api.patch(`/batches/${batchId}/status`, { status });
    return data.data ?? data;
};

/**
 * Permanently delete a batch.
 */
export const deleteBatch = async (batchId) => {
    const { data } = await api.delete(`/batches/${batchId}`);
    return data;
};

/**
 * Attach an additional course to a batch. The caller must own both the
 * batch and the course being attached (enforced server-side).
 */
export const addCourseToBatch = async (batchId, courseId) => {
    const { data } = await api.post(`/batches/${batchId}/courses/${courseId}`);
    return data.data ?? data;
};

/**
 * Detach a course from a batch.
 */
export const removeCourseFromBatch = async (batchId, courseId) => {
    const { data } = await api.delete(`/batches/${batchId}/courses/${courseId}`);
    return data.data ?? data;
};

/**
 * Students eligible to be added to this batch — enrolled in any of the
 * batch's linked courses, minus whoever is already a member.
 */
export const getEnrollableStudentsForBatch = async (batchId) => {
    const { data } = await api.get(`/batches/${batchId}/enrollable-students`);
    return data.data ?? data;
};

/**
 * Add a student to a batch.
 */
export const addStudentToBatch = async (batchId, studentId) => {
    const { data } = await api.post(`/batches/${batchId}/students`, { studentId });
    return data.data ?? data;
};

/**
 * Remove a student from a batch.
 */
export const removeStudentFromBatch = async (batchId, studentId) => {
    const { data } = await api.delete(`/batches/${batchId}/students/${studentId}`);
    return data.data ?? data;
};

/**
 * Full batch detail dashboard — overview, student summary, activity feed,
 * upcoming schedule, student list, and announcements, pooled across every
 * course linked to this batch.
 */
export const getBatchDetailDashboard = async (batchId) => {
    const { data } = await api.get(`/batches/${batchId}/dashboard`);
    return data.data ?? data;
};

/**
 * Quizzes assigned to this batch, each with the batch roster's attempt
 * status/score for it — the "which students attempted which quizzes" trace.
 */
export const getBatchQuizzes = async (batchId) => {
    const { data } = await api.get(`/batches/${batchId}/quizzes`);
    return data.data ?? data;
};

/**
 * Batch-scoped announcements.
 */
export const getBatchAnnouncements = async (batchId) => {
    const { data } = await api.get(`/batches/${batchId}/announcements`);
    return data.data ?? data;
};

export const createBatchAnnouncement = async (batchId, { title, message }) => {
    const { data } = await api.post(`/batches/${batchId}/announcements`, { title, message });
    return data.data ?? data;
};

/**
 * Find-or-create the batch's group conversation (instructor + every current
 * batch student) and return it so the caller can navigate straight into it.
 */
export const startBatchConversation = async (batchId) => {
    const { data } = await api.post(`/batches/${batchId}/message`, {});
    return data.data ?? data;
};
