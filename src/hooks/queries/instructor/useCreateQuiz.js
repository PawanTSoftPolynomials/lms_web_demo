"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createQuiz } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createQuiz,

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