import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createContent } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createContent,

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer — otherwise the
            // data is only marked stale and won't actually refresh until
            // that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENTS,
                    variables.topicId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.TOPIC,
                    variables.topicId,
                ],
                refetchType: "all",
            });

            // The Course Composer sidebar shows a per-topic cell count from
            // MODULES (plural, courseId-scoped) — keep it in sync too.
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
