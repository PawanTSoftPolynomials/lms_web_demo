import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderQuizzes } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Batch quiz reorder used by the sidebar's swap logic when a quiz-to-quiz
 * (or quiz-to-content) move needs two rows to trade orders atomically —
 * mirrors useReorderContents, but simpler since quiz has no parent-type
 * cache-key ambiguity to resolve. Quizzes are read as part of the whole-course
 * fetch (getCourseById), not a separate query, so invalidating COURSE (and
 * MODULES, same as useUpdateQuizOrder) is what actually refreshes position.
 */
export function useReorderQuizzes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizzes }) => reorderQuizzes(quizzes),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODULES], refetchType: "all" });
        },
    });
}
