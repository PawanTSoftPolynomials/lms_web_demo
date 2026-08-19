import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, updateProfile } from "@/services/profile.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorProfile() {
    return useQuery({
        queryKey: [QUERY_KEYS.INSTRUCTOR_PROFILE],
        queryFn: getProfile,
        ...defaultQueryOptions,
    });
}

export function useUpdateInstructorProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_PROFILE] });
            // Also refresh the navbar's cached identity (name/avatar/etc.).
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
        },
    });
}
