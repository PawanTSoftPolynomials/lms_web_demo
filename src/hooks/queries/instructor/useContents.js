import { useQuery } from "@tanstack/react-query";

import { getContents } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useContents(lessonId) {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTENTS, lessonId],
        queryFn: () => getContents(lessonId),
        enabled: !!lessonId,
        ...defaultQueryOptions,
    });
}