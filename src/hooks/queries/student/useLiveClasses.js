"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLiveClasses, createLiveClass, updateLiveClassStatus, deleteLiveClass } from "@/services/liveClass.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLiveClasses(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.LIVE_CLASSES, params],
    queryFn: () => getLiveClasses(params),
    ...defaultQueryOptions,
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLiveClass,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIVE_CLASSES] }),
  });
}

export function useUpdateLiveClassStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ liveClassId, status }) => updateLiveClassStatus(liveClassId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIVE_CLASSES] }),
  });
}

export function useDeleteLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLiveClass,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIVE_CLASSES] }),
  });
}
