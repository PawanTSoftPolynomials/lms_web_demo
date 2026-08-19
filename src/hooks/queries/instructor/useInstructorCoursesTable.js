"use client";

import { useQuery } from "@tanstack/react-query";

import { getInstructorCoursesTable } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** Backs the My Courses table/grid — server-side search/filter/sort/pagination. */
export function useInstructorCoursesTable(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE, filters],
    queryFn: () => getInstructorCoursesTable(filters),
    ...defaultQueryOptions,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
