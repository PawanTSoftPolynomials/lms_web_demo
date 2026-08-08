import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { reorderContents } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** mutate({ lessonId, contents: [{ id, order }] }) */
export function useReorderContents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contents }) => reorderContents(contents),

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
