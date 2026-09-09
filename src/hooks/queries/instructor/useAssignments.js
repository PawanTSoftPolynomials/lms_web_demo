"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInstructorAssignments,
  updateAssignment,
  deleteAssignment,
} from "@/services/assignment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorAssignments(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, courseId],
    queryFn: () => getInstructorAssignments(courseId),
    ...defaultQueryOptions,
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSESSMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSESSMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}
