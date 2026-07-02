import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateLesson } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         lessonId,
                         lessonData,
                     }) =>
            updateLesson(
                lessonId,
                lessonData
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSON,
                    variables.lessonId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSONS,
                    variables.lessonData.moduleId,
                ],
            });
        },
    });
}