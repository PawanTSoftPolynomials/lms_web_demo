import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getStudents,
    getStudentById,
    updateStudent,
} from "@/services/students.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

/**
 * Get All Students
 */
export function useStudents() {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_STUDENTS],
        queryFn: getStudents,
        ...defaultQueryOptions,
    });
}

/**
 * Get Student By ID
 */
export function useStudent(studentId) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_STUDENT,
            studentId,
        ],
        queryFn: () =>
            getStudentById(studentId),
        enabled: !!studentId,
        ...defaultQueryOptions,
    });
}

/**
 * Update Student
 */
export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         studentId,
                         studentData,
                     }) =>
            updateStudent(
                studentId,
                studentData
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_STUDENTS,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_STUDENT,
                ],
            });
        },
    });
}