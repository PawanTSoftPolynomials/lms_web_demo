import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { markContentComplete, completeLesson as completeLessonApi, markVisited as markVisitedApi } from "@/services/progress.service";

/**
 * Marks Content complete/incomplete through the existing
 * POST /progress/content-complete endpoint, then refetches the authoritative
 * Progress roll-up. Nothing about the percentage is computed here.
 *
 * Accepts either a single `contentId` or a `contentIds` array. The array form
 * exists because one displayed block in the player can stand for several real
 * Content rows: groupLessonContentForDocumentView() merges consecutive HTML
 * rows into one readable document and records every underlying id in
 * `contentIds`. The backend counts each of those rows separately in the
 * Progress denominator, so completing the block has to complete all of them —
 * marking only the representative id would leave the merged-away rows
 * permanently incomplete and their ancestors permanently short of 100%.
 */
export function useCompleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, contentIds, completed = true }) => {
      const ids = (Array.isArray(contentIds) && contentIds.length > 0
        ? contentIds
        : [contentId]
      ).filter(Boolean);

      // Fails as a whole if any single row fails, so a partially-applied block
      // surfaces as an error rather than as silent, incomplete progress.
      return Promise.all(ids.map((id) => markContentComplete(id, completed)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
    }
  });
}

/**
 * Marks a Content/Quiz block as visited the first time the player shows it —
 * drives "Continue Learning" resume tracking (see lib/resumeTarget.js). Only
 * invalidates COURSE_PROGRESS: a visit never changes Enrollment.progressPercent
 * (that's completion-based), so the dashboard/My Courses queries have nothing
 * new to reflect and don't need refetching on every block view.
 *
 * Accepts either a single `contentId` or a `contentIds` array (same reason as
 * useCompleteContent above: a merged document block stands for several real
 * Content rows, every one of which needs its own visited flag) — or one of
 * the other entity ids (quizId, topicId, ...) markVisitedSchema accepts.
 */
export function useMarkVisited() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, contentIds, ...rest } = {}) => {
      const ids = (Array.isArray(contentIds) && contentIds.length > 0 ? contentIds : [contentId]).filter(Boolean);
      if (ids.length > 0) {
        return Promise.all(ids.map((id) => markVisitedApi({ contentId: id, ...rest })));
      }
      return markVisitedApi(rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_PROGRESS] });
    }
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, completed = true }) => completeLessonApi(lessonId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
    }
  });
}
