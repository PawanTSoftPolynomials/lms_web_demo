import api from "@/lib/axios";

export const getInstructors = async () => {
    try {
        const {data} = await api.get("/teachers");
        return data.data;
    } catch (error) {
        return [
            { id: "inst-1", name: "Dr. Sarah Connor" },
            { id: "inst-2", name: "Prof. Alan Turing" }
        ];
    }
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