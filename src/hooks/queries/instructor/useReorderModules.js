import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderModules } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useReorderModules() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, modules }) =>
            reorderModules(courseId, modules),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
