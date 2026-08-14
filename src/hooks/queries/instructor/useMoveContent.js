import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { moveContent } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** mutate({ contentId, parentContentId, lessonId }) — parentContentId: null promotes to top-level. */
export function useMoveContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId, parentContentId }) =>
            moveContent(contentId, parentContentId),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CONTENTS, variables.lessonId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
