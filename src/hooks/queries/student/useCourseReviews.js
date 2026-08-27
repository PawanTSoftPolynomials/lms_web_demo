"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourseReviews } from "@/services/review.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useCourseReviews(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_REVIEWS, courseId],
    queryFn: () => getCourseReviews(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}
