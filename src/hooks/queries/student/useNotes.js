"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, createNote, updateNote, deleteNote, toggleNoteStar } from "@/services/note.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useNotes(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTES, params],
    queryFn: () => getNotes(params),
    ...defaultQueryOptions,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTES] }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, payload }) => updateNote(noteId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTES] }),
  });
}

export function useToggleNoteStar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId) => toggleNoteStar(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTES] }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTES] }),
  });
}
