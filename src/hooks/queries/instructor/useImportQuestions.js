"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importQuestions } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useImportQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, file }) => importQuestions(quizId, file),

        onSuccess: (_, variables) => {
            queryClient.resetQueries({
                queryKey: [QUERY_KEYS.QUESTIONS, variables.quizId],
            });
            queryClient.resetQueries({
                queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
            });
        },
    });
}
