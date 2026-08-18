import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderTopics } from "@/services/topic.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useReorderTopics() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, topics }) =>
            reorderTopics(lessonId, topics),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
