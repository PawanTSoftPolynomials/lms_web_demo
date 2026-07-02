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
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENT,
                    variables.contentId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENTS,
                    variables.contentData.lessonId,
                ],
            });
        },
    });
}