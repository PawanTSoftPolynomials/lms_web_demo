import { useQuery } from "@tanstack/react-query";

import { getStudentProgress } from "@/services/student.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useProgress() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROGRESS],
    queryFn: async () => {
      const response = await getStudentProgress();

      const progressData = response?.stats || response?.data || response;
      const courses = response?.courses || response?.enrolledCourses || response?.enrolledCoursesList || [];

      return {
        stats: progressData || {},
        courses: courses.map((course) => ({
          id: course?.course?.id || course?.id,
          title: course?.course?.title || course?.title || "Untitled course",
          instructor: course?.course?.instructor || course?.instructor || "N/A",
          progress: course?.progress ?? course?.completionRate ?? 0,
          completedLessons: course?.completedLessons ?? 0,
          totalLessons: course?.totalLessons ?? course?.lessons ?? 0,
        })),
      };
    },
    ...defaultQueryOptions,
  });
}
