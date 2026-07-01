import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, courseData }) =>
            updateCourse(courseId, courseData),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.COURSE,
                    variables.courseId,
                ],
            });
        },
    });
}