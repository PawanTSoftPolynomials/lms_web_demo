import { useQuery } from "@tanstack/react-query";

import { getTopicById } from "@/services/topic.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useTopic(topicId) {
    return useQuery({
        queryKey: [QUERY_KEYS.TOPIC, topicId],
        queryFn: () => getTopicById(topicId),
        enabled: !!topicId,
        ...defaultQueryOptions,
    });
}
