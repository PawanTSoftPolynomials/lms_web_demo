"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createLessonQuery, getMyQuestions } from "@/services/lessonQuery.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** The current student's own questions across every lesson they've asked about. */
export function useMyQuestions(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_QUESTIONS, filters],
    queryFn: () => getMyQuestions(filters),
    ...defaultQueryOptions,
  });
}

export function useCreateLessonQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLessonQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_QUESTIONS] });
    },
  });
}
