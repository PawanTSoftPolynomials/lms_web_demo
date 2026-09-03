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
        // TopicContentRows only mounts this query when its topic is
        // expanded, so if a topic was ever expanded before it had content
        // (e.g. right after Module creation, or in an earlier visit) and
        // content was added since, refetchOnMount is what lets re-expanding
        // it later show the real persisted content instead of the cached
        // "No content yet" result forever — see useInstructorCourse.js for
        // why this is scoped per-hook rather than app-wide.
        refetchOnMount: true,
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