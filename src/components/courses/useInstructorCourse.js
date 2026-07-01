import { useQuery } from "@tanstack/react-query";

import { getCourseById } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorCourse(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSE, courseId],
        queryFn: () => getCourseById(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}