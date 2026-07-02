import { useQuery } from "@tanstack/react-query";

import { getStudentDashboard } from "@/services/student.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_DASHBOARD],
    queryFn: async () => {
      const response = await getStudentDashboard();
      const payload = response?.data || response;
      const stats = payload?.stats || payload;
      const courses = payload?.enrolledCoursesList || payload?.courses || payload?.enrolledCourses || [];

      return {
        stats: stats || {},
        courses: courses.map((courseItem) => {
          const course = courseItem?.course || courseItem;
          return {
            id: course?.id || courseItem?.courseId || courseItem?.id,
            title: course?.title || "Untitled course",
            instructor: course?.instructor || course?.creator?.name || "N/A",
            category: course?.category || "General",
            progress: courseItem?.progress ?? course?.progress ?? 0,
            completedLessons: courseItem?.completedLessons ?? 0,
            totalLessons: course?.lessons ?? course?.totalLessons ?? 0,
            description: course?.description || "",
          };
        }),
      };
    },
    ...defaultQueryOptions,
  });
}