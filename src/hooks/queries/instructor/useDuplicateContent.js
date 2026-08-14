import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { duplicateContent } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** mutate({ contentId, lessonId }) */
export function useDuplicateContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId }) =>
            duplicateContent(contentId),

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
