import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {updateContent} from "@/services/content.service";
import {QUERY_KEYS} from "@/constants/queryKeys";

export function useUpdateContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         contentId,
                         contentData,
                     }) =>
            updateContent(
                contentId,
                contentData
            ),

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer — otherwise the
            // data is only marked stale and won't actually refresh until
            // that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENT,
                    variables.contentId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENTS,
                    variables.contentData.topicId,
                ],
                refetchType: "all",
            });
        },
    });
}
