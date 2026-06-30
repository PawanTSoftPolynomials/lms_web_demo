import api from "@/lib/axios";

/**
 * Get All Students
 */
export const getStudents = async () => {
    const {data} = await api.get("/students");

    return data.data;
};

/**
 * Get Student By ID
 */
export const getStudentById = async (
    studentId
) => {
    const {data} = await api.get(
        `/students/${studentId}`
    );

    return data.data;
};

/**
 * Update Student
 */
export const updateStudent = async (
    studentId,
    studentData
) => {
    const {data} = await api.put(
        `/students/${studentId}`,
        studentData
    );

    return data;
};

/**
 * Get Student Progress
 */
export const getStudentProgress =
    async (studentId) => {
        const {data} = await api.get(
            `/students/${studentId}/progress`
        );

        return data.data;
    };