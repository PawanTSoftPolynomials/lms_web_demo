"use client";

import { useQuery } from "@tanstack/react-query";

import { getQuestions } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useQuestions(quizId) {
    return useQuery({
        queryKey: [QUERY_KEYS.QUESTIONS, quizId],
        queryFn: () => getQuestions(quizId),
        enabled: !!quizId,
        ...defaultQueryOptions,
    });
}