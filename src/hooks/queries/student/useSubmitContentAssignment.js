import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitContentAssignment } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useSubmitContentAssignment(contentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitContentAssignment(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTENT_SUBMISSION, contentId] });
      // The student Assignments page lists lesson assignments too.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ASSIGNMENTS] });

      // The backend marks the content block complete on submit and re-runs the
      // roll-up; refetch so the completion strip and percentages pick it up.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
    },
  });
}
