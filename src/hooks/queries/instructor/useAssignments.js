"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInstructorAssignments,
  getAssignmentSubmissions,
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

/**
 * Student submissions for one assignment, including the PDF each student
 * actually uploaded. `enabled` lets the caller fetch only when the instructor
 * opens the submissions list, rather than for every assignment on the page.
 */
export function useAssignmentSubmissions(assignmentId, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, assignmentId, "submissions"],
    queryFn: () => getAssignmentSubmissions(assignmentId),
    enabled: Boolean(assignmentId) && enabled,
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
