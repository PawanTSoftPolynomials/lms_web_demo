import { useQuery } from "@tanstack/react-query";

import { getCourses } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorCourses() {
    return useQuery({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
        queryFn: getCourses,
        ...defaultQueryOptions,
    });
}