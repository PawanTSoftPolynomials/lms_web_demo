"use client";

import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "@/hooks/queries/student/useBookmarks";

// Shared "bookmark this lesson" toggle — same derivation/mutation calls used
// by both the learning page and LessonTabs, so the two stay in sync instead
// of drifting as separately copy-pasted implementations.
export default function useLessonBookmarkToggle(lesson, course) {
  const { data: bookmarks = [] } = useBookmarks();
  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmark();

  const isLessonBookmarked =
    bookmarks?.some((b) => b.lessonId === lesson?.id && b.type === "Lesson") || false;

  const toggleLessonBookmark = async () => {
    if (!lesson) return;
    if (isLessonBookmarked) {
      const bookmark = bookmarks?.find(
        (b) => b.lessonId === lesson?.id && b.type === "Lesson"
      );
      if (bookmark) {
        try {
          await deleteBookmarkMutation.mutateAsync(bookmark.id);
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      try {
        await createBookmarkMutation.mutateAsync({
          type: "Lesson",
          title: lesson.title,
          detail: course?.title || "",
          courseId: course?.id || "",
          lessonId: lesson.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return { isLessonBookmarked, toggleLessonBookmark };
}
