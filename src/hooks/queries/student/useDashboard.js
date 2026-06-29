import { useQuery } from "@tanstack/react-query";

import { getMyEnrollments } from "@/services/enrollment.service";
import { getProgress } from "@/services/progress.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useDashboard(userId) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_DASHBOARD, userId],
    enabled: !!userId,

    queryFn: async () => {
      const enrollments = await getMyEnrollments(userId);

      const progressResponses = await Promise.all(
        enrollments.map((enrollment) =>
          getProgress(enrollment.courseId)
        )
      );

      let completed = 0;
      let totalLessons = 0;

      progressResponses.forEach((response) => {
        completed += response.data.completedLessons;
        totalLessons += response.data.totalLessons;
      });

      return {
        enrolled: enrollments.length,
        completed,
        progress:
          totalLessons > 0
            ? Math.round((completed / totalLessons) * 100)
            : 0,
      };
    },

    ...defaultQueryOptions,
  });
}