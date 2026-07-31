import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    getLessonQueries,
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

export function useReplyToLessonQuery(lessonId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, reply }) => replyToLessonQuery(queryId, reply),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_QUERIES, lessonId],
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
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}
