import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { reorderModules } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** mutate({ courseId, modules: [{ id, order }] }) */
export function useReorderModules() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ modules }) => reorderModules(modules),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES, variables.courseId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
