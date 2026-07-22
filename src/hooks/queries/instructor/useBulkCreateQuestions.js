"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateQuestions } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useBulkCreateQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, questions }) =>
            bulkCreateQuestions(quizId, questions),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUESTIONS, variables.quizId],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
            });
        },
    });
}
