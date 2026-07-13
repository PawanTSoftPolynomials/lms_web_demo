"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAchievements, checkAndAwardAchievements } from "@/services/achievement.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useMyAchievements() {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_ACHIEVEMENTS],
    queryFn: getMyAchievements,
    ...defaultQueryOptions,
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkAndAwardAchievements,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_ACHIEVEMENTS] }),
  });
}
