import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getEnrollments,
    deleteEnrollment,
} from "@/services/enrollment.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

/**
 * Get All Enrollments
 */
export function useEnrollments(
    userId,
    courseId
) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_ENROLLMENTS,
            userId,
            courseId,
        ],
        queryFn: () =>
            getEnrollments(
                userId,
                courseId
            ),
        ...defaultQueryOptions,
    });
}

/**
 * Delete Enrollment
 */
export function useDeleteEnrollment() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
        deleteEnrollment,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_ENROLLMENTS,
                ],
            });
        },
    });
}