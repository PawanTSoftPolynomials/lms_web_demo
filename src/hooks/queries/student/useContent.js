import { useQuery } from "@tanstack/react-query";

import { getContentById } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** One Content row by id — GET /contents/:id is role-agnostic (student/instructor/admin alike). */
export function useContent(contentId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTENT, contentId],
    queryFn: () => getContentById(contentId),
    enabled: Boolean(contentId),
    ...defaultQueryOptions,
  });
}
