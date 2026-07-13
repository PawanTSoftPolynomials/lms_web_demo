"use client";

import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import { updateStickyNote } from "../../../services/stickyNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateStickyNote() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      stickyNoteId,
      payload
    }) =>
      updateStickyNote(
        stickyNoteId,
        payload
      ),

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