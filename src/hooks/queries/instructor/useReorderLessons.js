import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderLessons } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useReorderLessons() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ moduleId, lessons }) =>
            reorderLessons(moduleId, lessons),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
