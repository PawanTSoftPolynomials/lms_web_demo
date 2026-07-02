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

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.QUIZZES,
                    variables.courseId,
                ],
            });
        },
    });
}