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
    });
}