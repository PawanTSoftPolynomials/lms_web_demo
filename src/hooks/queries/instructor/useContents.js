import { useQuery } from "@tanstack/react-query";

import { getContents, getInstructorContents } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useContents(topicId) {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTENTS, topicId],
        queryFn: () => getContents(topicId),
        enabled: !!topicId,
        ...defaultQueryOptions,
    });
}

/** Every content item across the instructor's own courses (no lesson filter). */
export function useInstructorContents() {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTENTS, "all"],
        queryFn: getInstructorContents,
        ...defaultQueryOptions,
    });
}