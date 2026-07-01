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
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES, variables.courseId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSE, variables.courseId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });
        },
    });
}