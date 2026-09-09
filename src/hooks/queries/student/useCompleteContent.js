import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { markContentComplete, completeLesson as completeLessonApi } from "@/services/progress.service";

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
