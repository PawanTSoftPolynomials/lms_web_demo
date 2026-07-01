import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/services/profile.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/**
 * Get Current User Profile
 */
export function useProfile() {
    return useQuery({
        queryKey: [
            QUERY_KEYS.PROFILE,
        ],
        queryFn: getProfile,
        ...defaultQueryOptions,
    });
}