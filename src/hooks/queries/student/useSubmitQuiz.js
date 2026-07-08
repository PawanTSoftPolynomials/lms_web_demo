import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitQuiz } from "@/services/quiz.service";

import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useSubmitQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, answers }) =>
            submitQuiz(quizId, answers),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZZES],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.QUIZ, variables.quizId],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.QUIZ_RESULT,
                    variables.quizId,
                ],
            });
        },
    });
}