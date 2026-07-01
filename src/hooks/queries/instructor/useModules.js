import { useQuery } from "@tanstack/react-query";

import { getModules } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useModules(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.MODULES, courseId],
        queryFn: () => getModules(courseId),
        enabled: !!courseId,
        ...defaultQueryOptions,
    });
}