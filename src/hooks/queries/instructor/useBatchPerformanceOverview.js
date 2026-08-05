"use client";

import { useQuery } from "@tanstack/react-query";

import { getBatchPerformanceOverview } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** Backs the Home dashboard's Batch Performance Overview widget. */
export function useBatchPerformanceOverview(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_PERFORMANCE_OVERVIEW, filters],
    queryFn: () => getBatchPerformanceOverview(filters),
    ...defaultQueryOptions,
  });
}
