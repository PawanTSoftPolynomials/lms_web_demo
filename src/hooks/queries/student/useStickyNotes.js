"use client";

import { useQuery } from "@tanstack/react-query";

import { getStickyNotes } from "@/services/stickyNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useStickyNotes(
  lessonId
) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.STICKY_NOTES,
      lessonId
    ],
    queryFn: () =>
      getStickyNotes(lessonId),
    enabled: !!lessonId,
    ...defaultQueryOptions
  });
}