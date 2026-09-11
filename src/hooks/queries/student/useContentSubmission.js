import { useQuery } from "@tanstack/react-query";

import { getMyContentSubmission } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useContentSubmission(contentId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTENT_SUBMISSION, contentId],
    queryFn: () => getMyContentSubmission(contentId),
    enabled: Boolean(contentId),
    ...defaultQueryOptions,
  });
}
