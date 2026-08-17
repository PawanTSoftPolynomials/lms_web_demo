import { useQuery } from "@tanstack/react-query";

import { getQuizResult } from "@/services/quiz.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useQuizResult(
    quizId
) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.QUIZ_RESULT,
            quizId,
        ],
        queryFn: () =>
            getQuizResult(quizId),
        enabled: !!quizId,
        ...defaultQueryOptions,
        // Scoped override: a retake invalidates this query before the result
        // page remounts (useSubmitQuiz.js), so this specific query must
        // refetch stale data on mount instead of silently serving the
        // previous attempt's cached submission.answers. Other queries keep
        // defaultQueryOptions' refetchOnMount: false unchanged.
        refetchOnMount: true,
    });
}