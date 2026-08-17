import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteModule } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteModule,

        onSuccess: () => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer — otherwise the
            // data is only marked stale and won't actually refresh until
            // that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
                refetchType: "all",
            });
        },
    });
}
