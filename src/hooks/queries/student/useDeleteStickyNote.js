"use client";

import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import { deleteStickyNote } from "../../../services/stickyNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useDeleteStickyNote() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (stickyNoteId) =>
      deleteStickyNote(stickyNoteId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.STICKY_NOTES
        ],
        exact: false
      });
    }
  });
}