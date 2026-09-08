import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";
import { getCourseProgress, getOverallProgress, getInstructorCourseProgress } from "@/services/progress.service";

export function useCourseProgress(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_PROGRESS, courseId],
    queryFn: () => getCourseProgress(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions
  });
}

export function useOverallProgress() {
  return useQuery({
    queryKey: [QUERY_KEYS.PROGRESS],
    queryFn: () => getOverallProgress(),
    ...defaultQueryOptions
  });
}

export function useInstructorCourseProgress(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSE, "progress", courseId],
    queryFn: () => getInstructorCourseProgress(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions
  });
}
