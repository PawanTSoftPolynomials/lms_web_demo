import { useQuery } from "@tanstack/react-query";

import { getCourseStudents } from "@/services/course.service";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useCourseStudents(courseId) {
    return useQuery({
        queryKey: ["course-students", courseId],
        queryFn: () => getCourseStudents(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}
