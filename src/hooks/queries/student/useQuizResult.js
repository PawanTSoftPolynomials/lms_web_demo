import { useQuery } from "@tanstack/react-query";

import { getQuizResult } from "@/services/quiz.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/**
 * A student's result for one quiz — the latest attempt by default, or a
 * specific earlier attempt when attemptId is given.
 */
export default function useQuizResult(
    quizId,
    { enabled = true, attemptId = null } = {}
) {
    return useQuery({
        // [QUIZ_RESULT, quizId] stays the prefix, so useSubmitQuiz's
        // invalidation still reaches every attempt of this quiz.
        queryKey: [
            QUERY_KEYS.QUIZ_RESULT,
            quizId,
            attemptId ?? "latest",
        ],
        queryFn: () =>
            getQuizResult(quizId, attemptId),
        enabled: !!quizId && enabled,
        ...defaultQueryOptions,
        // Scoped override: a retake invalidates this query before the result
        // page remounts (useSubmitQuiz.js), so this specific query must
        // refetch stale data on mount instead of silently serving the
        // previous attempt's cached submission.answers. Other queries keep
        // defaultQueryOptions' refetchOnMount: false unchanged.
        refetchOnMount: true,
    });
}
