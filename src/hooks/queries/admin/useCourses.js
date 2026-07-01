import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus,
} from "@/services/course.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

/**
 * Get All Courses
 */
export function useCourses() {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_COURSES,
        ],
        queryFn: getCourses,
        ...defaultQueryOptions,
    });
}

/**
 * Get Course By ID
 */
export function useCourse(courseId) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.ADMIN_COURSE,
            courseId,
        ],
        queryFn: () =>
            getCourseById(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}

/**
 * Create Course
 */
export function useCreateCourse() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: createCourse,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSES,
                ],
            });
        },
    });
}

/**
 * Update Course
 */
export function useUpdateCourse() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
                         courseId,
                         courseData,
                     }) =>
            updateCourse(
                courseId,
                courseData
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSES,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSE,
                ],
            });
        },
    });
}

/**
 * Delete Course
 */
export function useDeleteCourse() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: deleteCourse,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSES,
                ],
            });
        },
    });
}

/**
 * Update Course Status
 */
export function useUpdateCourseStatus() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
                         courseId,
                         status,
                     }) =>
            updateCourseStatus(
                courseId,
                status
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSES,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.ADMIN_COURSE,
                ],
            });
        },
    });
}