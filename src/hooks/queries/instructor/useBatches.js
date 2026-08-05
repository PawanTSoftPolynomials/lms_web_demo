"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCourseBatches,
  getMyBatches,
  createCourseBatch,
  getBatchById,
  getEnrollableStudentsForBatch,
  addStudentToBatch,
  removeStudentFromBatch,
  getBatchDetailDashboard,
  updateBatchStatus,
  getBatchAnnouncements,
  createBatchAnnouncement,
  startBatchConversation,
} from "@/services/course.service";
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

export function useBatchDetail(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_DETAIL, batchId],
    queryFn: () => getBatchById(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}

export function useEnrollableStudentsForBatch(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_ENROLLABLE_STUDENTS, batchId],
    queryFn: () => getEnrollableStudentsForBatch(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}

export function useAddStudentToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, studentId }) => addStudentToBatch(batchId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_ENROLLABLE_STUDENTS, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_PERFORMANCE_OVERVIEW] });
    },
  });
}

export function useRemoveStudentFromBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, studentId }) => removeStudentFromBatch(batchId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_ENROLLABLE_STUDENTS, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_PERFORMANCE_OVERVIEW] });
    },
  });
}

export function useBatchDetailDashboard(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_DASHBOARD, batchId],
    queryFn: () => getBatchDetailDashboard(batchId),
    enabled: !!batchId,
    ...defaultQueryOptions,
  });
}

export function useUpdateBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, status }) => updateBatchStatus(batchId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_PERFORMANCE_OVERVIEW] });
    },
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

export function useCreateBatchAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, title, message }) => createBatchAnnouncement(batchId, { title, message }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_ANNOUNCEMENTS, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
    },
  });
}

export function useStartBatchConversation() {
  return useMutation({
    mutationFn: (batchId) => startBatchConversation(batchId),
  });
}
