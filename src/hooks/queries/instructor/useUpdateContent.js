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
            const parentType = variables.parent?.parentType
                ?? (variables.contentData?.topicId ? "topic" : undefined);
            const parentId = variables.parent?.parentId ?? variables.contentData?.topicId;

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
                    parentType,
                    parentId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
