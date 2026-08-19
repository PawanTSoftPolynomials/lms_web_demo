import { useQuery } from "@tanstack/react-query";

import { getStoreCourses } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useStoreCourses() {
  return useQuery({
    queryKey: [QUERY_KEYS.STORE_COURSES],
    queryFn: getStoreCourses,
    ...defaultQueryOptions,
  });
}
