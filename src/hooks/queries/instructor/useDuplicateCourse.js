import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDuplicateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: duplicateCourse,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}
