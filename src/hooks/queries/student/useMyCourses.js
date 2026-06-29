import { useQuery } from "@tanstack/react-query";

import { getMyEnrollments } from "@/services/enrollment.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useMyCourses(userId) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_COURSES, userId],
    queryFn: () => getMyEnrollments(userId),
    enabled: !!userId,
    ...defaultQueryOptions,
  });
}