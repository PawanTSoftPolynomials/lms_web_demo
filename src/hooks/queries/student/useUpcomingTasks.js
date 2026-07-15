import { useQuery } from "@tanstack/react-query";

import { getUpcomingTasks } from "@/services/student/upcomingTask.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useUpcomingTasks() {
  return useQuery({
    queryKey: [QUERY_KEYS.UPCOMING_TASKS],
    queryFn: getUpcomingTasks,
    refetchInterval: 60000,
    ...defaultQueryOptions,
  });
}
