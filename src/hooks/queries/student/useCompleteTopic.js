import {useMutation, useQueryClient} from "@tanstack/react-query";

import {completeTopic} from "@/services/progress.service";

import {QUERY_KEYS} from "@/constants/queryKeys";

export default function useCompleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: completeTopic,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.STUDENT_PROGRESS],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.STUDENT_DASHBOARD],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MY_COURSES],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSE],
            });
        },
    });
}
