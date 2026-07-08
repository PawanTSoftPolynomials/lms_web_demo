import { useQuery } from "@tanstack/react-query";

import { getInstructorDashboard } from "@/services/dashboard.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorDashboard() {
    return useQuery({
        queryKey: [QUERY_KEYS.INSTRUCTOR_DASHBOARD],
        queryFn: getInstructorDashboard,
        ...defaultQueryOptions,
    });
}