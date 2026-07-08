import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getInstructors,
    getInstructorById,
    updateInstructor,
} from "@/services/instructor.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

/**
 * Get All Instructors
 */
export function useInstructors() {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_INSTRUCTORS,
        ],
        queryFn: getInstructors,
        ...defaultQueryOptions,
    });
}

/**
 * Get Instructor By ID
 */
export function useInstructor(
    instructorId
) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_INSTRUCTOR,
            instructorId,
        ],
        queryFn: () =>
            getInstructorById(
                instructorId
            ),
        enabled: !!instructorId,
        ...defaultQueryOptions,
    });
}

/**
 * Update Instructor
 */
export function useUpdateInstructor() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
                         instructorId,
                         instructorData,
                     }) =>
            updateInstructor(
                instructorId,
                instructorData
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_INSTRUCTORS,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_INSTRUCTOR,
                ],
            });
        },
    });
}