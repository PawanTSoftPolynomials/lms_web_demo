import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useArchiveCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseId) => archiveCourse(courseId),

        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE, courseId],
            });
        },
    });
}
