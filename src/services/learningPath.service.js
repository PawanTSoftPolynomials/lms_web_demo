import api from "@/lib/axios";

/**
 * Full personalized learning path for a student, including
 * `recommendedLearningOrder` — each item enriched with
 * `recommendedMode`/`recommendedMinutes`/`aiPersonalizationReason` once
 * that student has completed an AI Entry Assessment for the active course.
 * 404s until Learning Path has calculated at least once for this student
 * (normal for a brand new enrollment, not an error).
 */
export const getMyLearningPath = async (studentId) => {
    const { data } = await api.get(`/learning-path/${studentId}`);
    return data.data;
};
