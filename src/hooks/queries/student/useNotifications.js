import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/services/notification.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useNotifications() {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: getNotifications,
    ...defaultQueryOptions,
  });
}
