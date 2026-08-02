"use client";

import { useQuery } from "@tanstack/react-query";

import { getResults } from "@/services/results.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useResults(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.RESULTS, filters],
    queryFn: () => getResults(filters),
    ...defaultQueryOptions,
  });
}
