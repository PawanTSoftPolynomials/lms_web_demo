import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { reorderLessons } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** mutate({ moduleId, lessons: [{ lessonId, order }] }) */
export function useReorderLessons() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessons }) => reorderLessons(lessons),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSONS, variables.moduleId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
