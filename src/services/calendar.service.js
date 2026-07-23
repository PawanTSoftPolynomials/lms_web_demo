import api from "@/lib/axios";

/**
 * Get all calendar events (real API)
 */
export const getCalendarEvents = async () => {
  try {
    const { data } = await api.get("/calendar");
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    // Return empty array if backend calendar endpoint returns no data or fails
    return [];
  }
};

/**
 * Create a calendar event (real API)
 */
export const createCalendarEvent = async (eventData) => {
  const { data } = await api.post("/calendar", eventData);
  return data.data ?? data;
};

/**
 * Delete a calendar event (real API)
 */
export const deleteCalendarEvent = async (eventId) => {
  await api.delete(`/calendar/${eventId}`);
};
