import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createLesson } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLesson,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSONS,
                    variables.moduleId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULE,
                    variables.moduleId,
                ],
            });
        },
    });
}