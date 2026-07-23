import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollCourse } from "@/services/enrollment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => enrollCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
    },
  });
}
