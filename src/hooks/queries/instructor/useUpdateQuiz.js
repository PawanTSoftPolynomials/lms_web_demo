"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateQuiz } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, quizData }) =>
            updateQuiz(quizId, {
                title: quizData.title,
                description: quizData.description,
                passingScore: quizData.passingScore,
                timeLimit: quizData.timeLimit,
            }),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZZES, variables.courseId],
            });
        },
    });
}