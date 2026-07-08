import { useQuery } from "@tanstack/react-query";

import { getModuleById } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useModule(moduleId) {
    return useQuery({
        queryKey: [QUERY_KEYS.MODULE, moduleId],
        queryFn: () => getModuleById(moduleId),
        enabled: !!moduleId,
        ...defaultQueryOptions,
    });
}