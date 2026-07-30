import { useQuery } from "@tanstack/react-query";

import { getCourseReviews, getCourseReviewStats } from "@/services/review.service";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useCourseReviews(courseId) {
    return useQuery({
        queryKey: ["course-reviews", courseId],
        queryFn: () => getCourseReviews(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}

export function useCourseReviewStats(courseId) {
    return useQuery({
        queryKey: ["course-review-stats", courseId],
        queryFn: () => getCourseReviewStats(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}
