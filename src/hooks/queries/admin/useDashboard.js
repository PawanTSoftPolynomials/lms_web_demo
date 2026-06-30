import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "@/services/dashboard.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn: getAdminDashboard,
    ...defaultQueryOptions,
  });
}