import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCourse,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}