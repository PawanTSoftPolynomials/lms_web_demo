"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {updateQuestion} from "@/services/question.service";
import {QUERY_KEYS} from "@/constants/queryKeys";

export function useUpdateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         questionId,
                         questionData,
                     }) =>
            updateQuestion(
                questionId,
                {
                    question: questionData.question,
                    options: questionData.options,
                    correctAnswer:
                    questionData.correctAnswer,
                    marks: questionData.marks,
                }
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.QUESTION,
                    variables.questionId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.QUESTIONS,
                    variables.quizId,
                ],
            });
        },
    });
}