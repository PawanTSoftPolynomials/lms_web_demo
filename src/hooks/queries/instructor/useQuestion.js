"use client";

import { useQuery } from "@tanstack/react-query";

import { getQuestionById } from "@/services/question.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useQuestion(questionId) {
    return useQuery({
        queryKey: [QUERY_KEYS.QUESTION, questionId],
        queryFn: () => getQuestionById(questionId),
        enabled: !!questionId,
        ...defaultQueryOptions,
    });
}