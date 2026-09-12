import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackCourseAccess } from "@/services/enrollment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useTrackCourseAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => trackCourseAccess(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
    },
  });
}
