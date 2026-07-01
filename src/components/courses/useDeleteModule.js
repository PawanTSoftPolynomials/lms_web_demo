import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteModule } from "@/services/modules.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteModule,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
            });
        },
    });
}