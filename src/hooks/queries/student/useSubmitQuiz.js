import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitQuiz } from "@/services/quiz.service";

import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useSubmitQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, answers }) =>
            submitQuiz(quizId, answers),

        onSuccess: (data, variables) => {
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

            // A submitted quiz can complete its parent Topic/Lesson/Module and
            // move the course percentage, but that roll-up happens server-side —
            // so the progress caches have to be refetched rather than patched
            // locally. Mirrors useCompleteContent's invalidation set.
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_PROGRESS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
        },
    });
}