"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteQuestion } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId }) =>
            deleteQuestion(questionId),

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