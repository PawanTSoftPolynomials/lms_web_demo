import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateCourseStatus } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateCourseStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         courseId,
                         status,
                     }) =>
            updateCourseStatus(
                courseId,
                status
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.INSTRUCTOR_COURSES,
                ],
            });

            // useInstructorCourse (the course detail page) caches under
            // QUERY_KEYS.COURSE, not QUERY_KEYS.INSTRUCTOR_COURSE.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.COURSE,
                    variables.courseId,
                ],
            });
        },
    });
}
