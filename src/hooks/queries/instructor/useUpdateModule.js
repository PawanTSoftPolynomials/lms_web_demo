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
            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULE,
                    variables.moduleId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.MODULES,
                    variables.moduleData.courseId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.INSTRUCTOR_COURSE,
                    variables.moduleData.courseId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    QUERY_KEYS.INSTRUCTOR_COURSES,
                ],
            });
        },
    });
}