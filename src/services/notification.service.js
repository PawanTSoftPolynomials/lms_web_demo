import api from "@/lib/axios";

/**
 * Get My Notifications
 */
export const getNotifications = async () => {
    const { data } = await api.get("/notifications");
    return data.data;
};

/**
 * Mark a Notification as Read
 */
export const markNotificationAsRead = async (notificationId) => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    return data.data;
};

/**
 * Mark All Notifications as Read
 */
export const markAllNotificationsAsRead = async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data.data;
};
