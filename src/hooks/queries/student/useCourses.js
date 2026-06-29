import { useQuery } from "@tanstack/react-query";

import { getCourses } from "@/services/course.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useCourses() {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES],
    queryFn: getCourses,
    ...defaultQueryOptions,
  });
}