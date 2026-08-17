"use client";

import { useQuery } from "@tanstack/react-query";

import { getCourseState } from "@/services/entryAssessment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** Per-course AI personalization baseline — 404s until the student completes that course's entry assessment, which is a normal, not an error, state. */
export default function useCourseState(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSE_STATE, courseId],
        queryFn: () => getCourseState(courseId),
        enabled: Boolean(courseId),
        retry: false,
        throwOnError: false,
    });
}
