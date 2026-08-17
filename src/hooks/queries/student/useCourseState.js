"use client";

import { useQuery } from "@tanstack/react-query";

import { getCourseState } from "@/services/entryAssessment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Per-course AI personalization baseline. Resolves to `null` (not an error)
 * until the student completes that course's entry assessment — see
 * getCourseState()'s 404 handling. `retry: false` only guards against
 * retry-storming this non-critical, additive card on a genuine backend error.
 */
export default function useCourseState(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSE_STATE, courseId],
        queryFn: () => getCourseState(courseId),
        enabled: Boolean(courseId),
        retry: false,
    });
}
