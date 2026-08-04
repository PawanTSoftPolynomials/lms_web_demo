import api from "@/lib/axios";

/**
 * Fetch announcements for a course
 */
export const getCourseAnnouncements = async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/announcements`);
    return data.data;
};

/**
 * Create a new announcement for a course
 */
export const createCourseAnnouncement = async (courseId, announcementData) => {
    const { data } = await api.post(`/courses/${courseId}/announcements`, announcementData);
    return data;
};
