"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getMyBatches,
  getBatchById,
  getBatchDetailDashboard,
  getBatchAnnouncements,
} from "@/services/student/batch.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useMyBatches(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_BATCHES, "student", filters],
    queryFn: () => getMyBatches(filters),
    ...defaultQueryOptions,
  });
}

export function useBatchDetail(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_DETAIL, batchId],
    queryFn: () => getBatchById(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}

export function useBatchDashboard(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_DASHBOARD, batchId],
    queryFn: () => getBatchDetailDashboard(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}

export function useBatchAnnouncements(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_ANNOUNCEMENTS, batchId],
    queryFn: () => getBatchAnnouncements(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}
