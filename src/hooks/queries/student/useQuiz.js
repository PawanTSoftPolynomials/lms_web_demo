import {useQuery} from "@tanstack/react-query";

import {getQuizById} from "@/services/quiz.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

export default function useQuiz(quizId) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.QUIZ,
            quizId,
        ],
        queryFn: () => getQuizById(quizId),
        enabled: !!quizId,
        ...defaultQueryOptions,
    });
}