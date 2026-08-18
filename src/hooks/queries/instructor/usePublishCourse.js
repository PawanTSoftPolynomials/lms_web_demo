import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function usePublishCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseId) => publishCourse(courseId),

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
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MY_COURSES],
            });
        },
    });
}
