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
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer (e.g. the
            // Course Composer sidebar when this mutation runs from a
            // different page) — otherwise the data is only marked stale and
            // won't actually refresh until that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSONS,
                    variables.moduleId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULE,
                    variables.moduleId,
                ],
                refetchType: "all",
            });

            // The Course Composer sidebar reads the full Module -> Lesson ->
            // Topic tree from MODULES (plural, courseId-scoped), which this
            // mutation also changes the shape of but doesn't otherwise touch.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });

        },
    });
}
