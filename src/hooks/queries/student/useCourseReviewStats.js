"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourseReviewStats } from "@/services/review.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useCourseReviewStats(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_REVIEW_STATS, courseId],
    queryFn: () => getCourseReviewStats(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}
