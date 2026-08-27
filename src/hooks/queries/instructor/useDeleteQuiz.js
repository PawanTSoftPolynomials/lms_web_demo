"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteQuiz } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId }) =>
            deleteQuiz(quizId),

        onSuccess: () => {
            // No courseId suffix: matches every useQuizzes() cache entry,
            // both the global (no-arg) list and any course-scoped ones —
            // a courseId-scoped key here would miss the global list.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZZES],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}