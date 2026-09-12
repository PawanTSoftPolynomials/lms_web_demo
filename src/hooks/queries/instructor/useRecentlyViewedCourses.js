"use client";

import { useQuery } from "@tanstack/react-query";

import { getInstructorCoursesTable } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

const FILTERS = { sortBy: "recently_viewed", limit: 5, page: 1 };

/** Top few courses the instructor most recently opened, for the My Courses "Recently Viewed" row. */
export function useRecentlyViewedCourses() {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE, FILTERS],
    queryFn: ({ signal }) => getInstructorCoursesTable(FILTERS, { signal }),
    ...defaultQueryOptions,
    select: (data) => (data?.courses || []).filter((c) => c.lastViewedAt),
  });
}
