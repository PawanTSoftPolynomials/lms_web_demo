import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    getLessonQueries,
    getMyLessonQueries,
    replyToLessonQuery,
    updateLessonQueryStatus,
} from "@/services/lessonQuery.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLessonQueries(lessonId) {
    return useQuery({
        queryKey: [QUERY_KEYS.LESSON_QUERIES, lessonId],
        queryFn: () => getLessonQueries(lessonId),
        enabled: !!lessonId,
        ...defaultQueryOptions,
    });
}

/** Doubts across every course the instructor owns — backs the Q&A nav page. */
export function useMyLessonQueries(filters = {}) {
    return useQuery({
        queryKey: [QUERY_KEYS.MY_LESSON_QUERIES, filters],
        queryFn: () => getMyLessonQueries(filters),
        ...defaultQueryOptions,
    });
}

export function useReplyToLessonQuery(lessonId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, reply }) => replyToLessonQuery(queryId, reply),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_QUERIES, lessonId],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MY_LESSON_QUERIES],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}

export function useUpdateLessonQueryStatus(lessonId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, status }) => updateLessonQueryStatus(queryId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_QUERIES, lessonId],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MY_LESSON_QUERIES],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}
