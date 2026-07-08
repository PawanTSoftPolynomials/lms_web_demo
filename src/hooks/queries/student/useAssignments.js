import { useQuery } from "@tanstack/react-query";

import { getAssignments } from "@/services/assignment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useAssignments() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ASSIGNMENTS],
    queryFn: () => getAssignments(),
    ...defaultQueryOptions,
  });
}
