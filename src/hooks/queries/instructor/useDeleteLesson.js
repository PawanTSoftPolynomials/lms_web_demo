import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteLesson } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId }) =>
            deleteLesson(lessonId),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSONS,
                    variables.moduleId,
                ],
            });

            queryClient.removeQueries({
                queryKey: [
                    QUERY_KEYS.LESSON,
                    variables.lessonId,
                ],
            });
        },
    });
}