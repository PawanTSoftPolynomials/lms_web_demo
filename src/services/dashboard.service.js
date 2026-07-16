import api from "@/lib/axios";

/**
 * Get Admin Dashboard
 */
export const getAdminDashboard = async () => {
    const {data} = await api.get(
        "/dashboard/admin"
    );

    return data.data;
};

/**
 * Get Instructor Dashboard
 */
export const getInstructorDashboard =
    async (courseId) => {
        const url = courseId && courseId !== 'all'
            ? `/dashboard/instructor?courseId=${courseId}`
            : "/dashboard/instructor";
        const {data} = await api.get(url);

        return data.data;
    };

/**
 * Get Student Dashboard
 */
/**
 * Get Student Dashboard
 */
export const getStudentDashboard = async () => {
    const {data} = await api.get(
        "/dashboard/student"
    );

    return data.data;
};