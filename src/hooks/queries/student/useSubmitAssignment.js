import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "@/services/assignment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useSubmitAssignment(assignmentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitAssignment(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ASSIGNMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ASSIGNMENT, assignmentId] });
    },
  });
}
