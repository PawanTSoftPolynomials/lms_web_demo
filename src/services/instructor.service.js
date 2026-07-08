import api from "@/lib/axios";

/**
 * Get All Instructors
 */
export const getInstructors = async () => {
    const {data} = await api.get("/teachers");

    return data.data;
};

/**
 * Get Instructor By ID
 */
export const getInstructorById = async (
    instructorId
) => {
    const {data} = await api.get(
        `/teachers/${instructorId}`
    );

    return data.data;
};

/**
 * Update Instructor
 */
export const updateInstructor = async (
    instructorId,
    instructorData
) => {
    const {data} = await api.put(
        `/teachers/${instructorId}`,
        instructorData
    );

    return data;
};