import { useQuery } from "@tanstack/react-query";

import { getQuizzes } from "@/services/quiz.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useQuizzes(courseId) {
    return useQuery({
        queryKey: [
            QUERY_KEYS.QUIZZES,
            courseId ?? "all",
        ],
        queryFn: () => getQuizzes(courseId),
        ...defaultQueryOptions,
    });
}