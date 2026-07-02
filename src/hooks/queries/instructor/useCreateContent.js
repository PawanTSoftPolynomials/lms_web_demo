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
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.CONTENTS,
                    variables.lessonId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.LESSON,
                    variables.lessonId,
                ],
            });
        },
    });
}