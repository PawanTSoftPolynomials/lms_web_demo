import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateTopic } from "@/services/topic.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         topicId,
                         topicData,
                     }) =>
            updateTopic(
                topicId,
                topicData
            ),

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer — otherwise the
            // data is only marked stale and won't actually refresh until
            // that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.TOPIC,
                    variables.topicId,
                ],
                refetchType: "all",
            });

            if (variables.topicData?.lessonId) {
                queryClient.invalidateQueries({
                    queryKey: [
                        QUERY_KEYS.TOPICS,
                        variables.topicData.lessonId,
                    ],
                    refetchType: "all",
                });
            }

            // Keep the Course Composer sidebar's Module -> Lesson -> Topic
            // tree (MODULES, plural) in sync too.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
