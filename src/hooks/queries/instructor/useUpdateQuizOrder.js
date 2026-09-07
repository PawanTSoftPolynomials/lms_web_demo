import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuiz } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * One-field quiz update used only for the sidebar's up/down reorder — a
 * quiz's full edit form (title/questions/etc.) goes through its own
 * dedicated composer screen, untouched by this hook. Quizzes are read as
 * part of the whole-course fetch (getCourseById), not a separate query, so
 * invalidating COURSE is what actually refreshes a quiz's position.
 */
export function useUpdateQuizOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, order }) => updateQuiz(quizId, { order }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
                refetchType: "all",
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
