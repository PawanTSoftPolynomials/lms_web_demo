"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCourseBatches, getMyBatches, createCourseBatch } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useCourseBatches(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCHES, courseId],
    queryFn: () => getCourseBatches(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}

export function useMyBatches(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_BATCHES, filters],
    queryFn: () => getMyBatches(filters),
    ...defaultQueryOptions,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, batchData }) => createCourseBatch(courseId, batchData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCHES, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}
