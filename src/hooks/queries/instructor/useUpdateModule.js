import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {updateModule} from "@/services/module.service";
import {QUERY_KEYS} from "@/constants/queryKeys";

export function useUpdateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         moduleId,
                         moduleData,
                     }) =>
            updateModule(
                moduleId,
                moduleData
            ),

        onSuccess: (_, variables) => {
            // refetchType: "all" forces an immediate background refetch even
            // for queries with no currently-mounted observer (e.g. the
            // Course Composer sidebar when this mutation runs from a
            // different page) — otherwise the data is only marked stale and
            // won't actually refresh until that page is hard-reloaded.
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULE,
                    variables.moduleId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULES,
                    variables.moduleData.courseId,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.INSTRUCTOR_COURSES,
                ],
                refetchType: "all",
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
