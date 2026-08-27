import { useMutation } from "@tanstack/react-query";
import { trackCourseAccess } from "@/services/enrollment.service";

export default function useTrackCourseAccess() {
  return useMutation({
    mutationFn: (courseId) => trackCourseAccess(courseId),
  });
}
