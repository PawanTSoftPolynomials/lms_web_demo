"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookmarks, createBookmark, deleteBookmark } from "@/services/bookmark.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useBookmarks(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKMARKS, params],
    queryFn: () => getBookmarks(params),
    ...defaultQueryOptions,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] }),
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] }),
  });
}
