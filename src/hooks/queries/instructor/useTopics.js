import { useQuery } from "@tanstack/react-query";

import { getTopics } from "@/services/topic.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useTopics(lessonId) {
    return useQuery({
        queryKey: [QUERY_KEYS.TOPICS, lessonId],
        queryFn: () => getTopics(lessonId),
        enabled: !!lessonId,
        ...defaultQueryOptions,
    });
}
