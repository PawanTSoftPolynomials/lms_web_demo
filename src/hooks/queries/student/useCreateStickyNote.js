"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createStickyNote } from "@/services/stickyNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateStickyNote() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createStickyNote,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.STICKY_NOTES,
          variables.lessonId
        ]
      });
    }
  });
}