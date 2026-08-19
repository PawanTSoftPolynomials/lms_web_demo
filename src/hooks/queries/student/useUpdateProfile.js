"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/services/profile.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // This mutation is shared by the student, admin, and instructor
      // "edit profile" flows -- invalidate every role's read key plus the
      // navbar's cached identity so whichever one is actually open refreshes.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
  });
}
