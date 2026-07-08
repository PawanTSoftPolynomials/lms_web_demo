import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteContent } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId }) =>
            deleteContent(contentId),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENTS,
                    variables.lessonId,
                ],
            });

            queryClient.removeQueries({
                queryKey: [
                    QUERY_KEYS.CONTENT,
                    variables.contentId,
                ],
            });
        },
    });
}