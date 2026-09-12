import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackCourseView } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** Marks a course as viewed by its instructor — backs the My Courses "Recently Viewed" row. */
export default function useTrackCourseView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => trackCourseView(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE] });
    },
  });
}
