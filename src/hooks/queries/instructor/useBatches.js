"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listBatches,
  createBatch,
  getBatchById,
  updateBatch,
  updateBatchStatus,
  deleteBatch,
  addCourseToBatch,
  removeCourseFromBatch,
  getEnrollableStudentsForBatch,
  addStudentToBatch,
  removeStudentFromBatch,
  getBatchDetailDashboard,
  getBatchQuizzes,
  getBatchAnnouncements,
  createBatchAnnouncement,
  startBatchConversation,
} from "@/services/batch.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** All batches linked to a single course — used by filter bars (Work pages, Results). */
export function useCourseBatches(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCHES, courseId],
    queryFn: () => listBatches({ courseId }),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}

/** General, filterable batch list — used by the Batches page. */
export function useBatches(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_BATCHES, filters],
    queryFn: () => listBatches(filters),
    ...defaultQueryOptions,
  });
}

function invalidateBatchLists(queryClient) {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCHES] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BATCHES] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_PERFORMANCE_OVERVIEW] });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createBatch(data),
    onSuccess: () => {
      invalidateBatchLists(queryClient);
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

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, data }) => updateBatch(batchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      invalidateBatchLists(queryClient);
    },
  });
}

export function useUpdateBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, status }) => updateBatchStatus(batchId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      invalidateBatchLists(queryClient);
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId) => deleteBatch(batchId),
    onSuccess: () => invalidateBatchLists(queryClient),
  });
}

export function useAddCourseToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, courseId }) => addCourseToBatch(batchId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_ENROLLABLE_STUDENTS, variables.batchId] });
      invalidateBatchLists(queryClient);
    },
  });
}

export function useRemoveCourseFromBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, courseId }) => removeCourseFromBatch(batchId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DETAIL, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_ENROLLABLE_STUDENTS, variables.batchId] });
      invalidateBatchLists(queryClient);
    },
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      invalidateBatchLists(queryClient);
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_DASHBOARD, variables.batchId] });
      invalidateBatchLists(queryClient);
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

export function useBatchQuizzes(batchId) {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_QUIZZES, batchId],
    queryFn: () => getBatchQuizzes(batchId),
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
