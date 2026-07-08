import { useQuery } from "@tanstack/react-query";

import { getContentById } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useContent(contentId) {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTENT, contentId],
        queryFn: () => getContentById(contentId),
        enabled: !!contentId,
        ...defaultQueryOptions,
    });
}