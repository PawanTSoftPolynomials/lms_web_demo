"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInstructorAssignments,
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
  updateAssignment,
  deleteAssignment,
} from "@/services/assignment.service";
import {
  getInstructorAssignmentContents,
  getContentSubmissions,
  gradeContentSubmission,
} from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorAssignments(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, courseId],
    queryFn: () => getInstructorAssignments(courseId),
    ...defaultQueryOptions,
  });
}

/** Lesson-composer Assignment blocks (Content type ASSIGNMENT) across the instructor's courses. */
export function useInstructorAssignmentContents() {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, "content"],
    queryFn: getInstructorAssignmentContents,
    ...defaultQueryOptions,
  });
}

/** Student submissions for one Assignment content block, fetched only when opened. */
export function useContentSubmissions(contentId, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, "content", contentId, "submissions"],
    queryFn: () => getContentSubmissions(contentId),
    enabled: Boolean(contentId) && enabled,
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

/**
 * Grades one submission. Pass `contentId` for a lesson-composer Assignment
 * block (Content row), `assignmentId` otherwise — same split as the panel.
 */
export function useGradeSubmission({ assignmentId, contentId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, grade, feedback }) =>
      contentId
        ? gradeContentSubmission(contentId, submissionId, { grade, feedback })
        : gradeAssignmentSubmission(assignmentId, submissionId, { grade, feedback }),
    onSuccess: () => {
      // Submission lists and the "ungraded" counts all live under ASSESSMENTS.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSESSMENTS] });
    },
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
