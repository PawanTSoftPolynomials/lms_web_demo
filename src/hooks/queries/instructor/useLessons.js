import { useQuery } from "@tanstack/react-query";

import { getLessons } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLessons(moduleId) {
    return useQuery({
        queryKey: [QUERY_KEYS.LESSONS, moduleId],
        queryFn: () => getLessons(moduleId),
        enabled: !!moduleId,
        ...defaultQueryOptions,
    });
}