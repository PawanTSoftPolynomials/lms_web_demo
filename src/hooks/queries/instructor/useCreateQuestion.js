"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createQuestion } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createQuestion,

        onSuccess: (_, variables) => {
            queryClient.resetQueries({
                queryKey: [
                    QUERY_KEYS.QUESTIONS,
                    variables.quizId,
                ],
            });
        },
    });
}