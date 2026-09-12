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
                // This hook allowlists fields, so a new one has to be added
                // here explicitly or it is silently dropped before the API.
                ...(quizData.quizTag !== undefined && { quizTag: quizData.quizTag }),
                ...(quizData.isPublished !== undefined && { isPublished: quizData.isPublished }),
                ...(quizData.attempts !== undefined && { attempts: Number(quizData.attempts) }),
                ...(quizData.status !== undefined && { status: quizData.status }),
            }),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZZES, variables.courseId],
            });

            // Invalidate course queries so the sidebar updates when a quiz is renamed/updated
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}