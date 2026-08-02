"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyReviews } from "@/services/review.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useMyReviews(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_REVIEWS, filters],
    queryFn: () => getMyReviews(filters),
    ...defaultQueryOptions,
  });
}
