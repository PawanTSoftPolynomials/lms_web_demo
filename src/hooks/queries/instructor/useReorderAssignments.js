import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderAssignments } from "@/services/assignment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Batch assignment reorder for the sidebar's up/down controls — mirrors
 * useReorderQuizzes. Assignments are read as part of the whole-course fetch
 * (getCourseById), not a separate query, so invalidating COURSE (and
 * MODULES) is what actually refreshes position.
 */
export function useReorderAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignments }) => reorderAssignments(assignments),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODULES], refetchType: "all" });
    },
  });
}
