import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";
import { getCourseProgress, getOverallProgress, getInstructorCourseProgress } from "@/services/progress.service";

export function useCourseProgress(courseId, studentId = null) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_PROGRESS, courseId, studentId],
    queryFn: () => getCourseProgress(courseId, studentId),
    enabled: !!courseId,
    ...defaultQueryOptions
  });
}

export function useOverallProgress(studentId = null) {
  return useQuery({
    queryKey: [QUERY_KEYS.PROGRESS, studentId],
    queryFn: () => getOverallProgress(studentId),
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
