"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/services/review.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_REVIEWS, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_REVIEW_STATS, variables.courseId] });
    },
  });
}
