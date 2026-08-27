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

            // Quiz list cards show a question count (quiz._count.questions)
            // derived from the QUIZZES query, not QUESTIONS — must be
            // invalidated separately or it goes stale after a delete.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZZES],
            });

            // The single-quiz detail view embeds its questions directly on
            // the quiz object (quiz.questions), fetched via useQuiz — a
            // different cache entry than QUESTIONS/QUIZZES above.
            if (variables.quizId) {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
                });
            }

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}