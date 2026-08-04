"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getExams, getExamById, createExam, updateExam, deleteExam } from "@/services/exam.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useExams(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.EXAMS, courseId],
    queryFn: () => getExams(courseId),
    ...defaultQueryOptions,
  });
}

export function useExam(examId) {
  return useQuery({
    queryKey: [QUERY_KEYS.EXAM, examId],
    queryFn: () => getExamById(examId),
    enabled: !!examId,
    ...defaultQueryOptions,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExam,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXAMS, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXAMS, undefined] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, examData }) => updateExam(examId, examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}
