import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createModule } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createModule,

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer (e.g. the
            // Course Composer sidebar when this mutation runs from a
            // different page) — otherwise the data is only marked stale and
            // won't actually refresh until that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES, variables.courseId],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
