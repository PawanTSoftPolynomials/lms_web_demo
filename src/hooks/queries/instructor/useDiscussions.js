"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDiscussions, createDiscussion } from "@/services/discussion.service";
import { defaultQueryOptions } from "@/lib/queryOptions";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDiscussions(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
    queryFn: () => getDiscussions(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}

export function useCreateDiscussion(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiscussion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
    },
  });
}
