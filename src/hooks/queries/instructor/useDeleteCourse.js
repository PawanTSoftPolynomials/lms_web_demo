import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCourse,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSE],
            });
        },
    });
}
