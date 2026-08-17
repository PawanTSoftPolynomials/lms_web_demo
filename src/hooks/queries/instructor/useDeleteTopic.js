import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteTopic } from "@/services/topic.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ topicId }) =>
            deleteTopic(topicId),

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer — otherwise the
            // data is only marked stale and won't actually refresh until
            // that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.TOPICS,
                    variables.lessonId,
                ],
                refetchType: "all",
            });

            queryClient.removeQueries({
                queryKey: [
                    QUERY_KEYS.TOPIC,
                    variables.topicId,
                ],
            });

            // Keep the Course Composer sidebar's Module -> Lesson -> Topic
            // tree (MODULES, plural) in sync too.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
                refetchType: "all",
            });
        },
    });
}
