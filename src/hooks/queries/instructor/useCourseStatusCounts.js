"use client";

import { useQuery } from "@tanstack/react-query";

import { getCourseStatusCounts } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** Backs the My Courses summary cards — real total/published/draft/archived counts. */
export function useCourseStatusCounts() {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES, "status-counts"],
    queryFn: getCourseStatusCounts,
    ...defaultQueryOptions,
  });
}
