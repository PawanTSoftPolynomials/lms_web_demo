import { useQuery } from "@tanstack/react-query";

import { getAssignmentById } from "@/services/assignment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useAssignment(assignmentId) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ASSIGNMENT, assignmentId],
    queryFn: () => getAssignmentById(assignmentId),
    enabled: Boolean(assignmentId),
    ...defaultQueryOptions,
  });
}
