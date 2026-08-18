import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderContents } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useReorderContents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contents }) =>
            reorderContents(contents),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CONTENTS, variables.topicId],
                refetchType: "all",
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
