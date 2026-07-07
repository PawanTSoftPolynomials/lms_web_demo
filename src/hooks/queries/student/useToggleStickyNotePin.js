"use client";

import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import { toggleStickyNotePin } from "../../../services/stickyNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useToggleStickyNotePin() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      toggleStickyNotePin,

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