import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDiscussions,
  createDiscussion,
  replyToDiscussion,
  updateDiscussion,
  deleteDiscussion,
  deleteDiscussionReply,
} from "@/services/discussion.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useDiscussions(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
    queryFn: () => getDiscussions(courseId),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}

export function useCreateDiscussion(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createDiscussion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}

export function useReplyToDiscussion(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discussionId, content }) => replyToDiscussion(discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
    },
  });
}

export function useUpdateDiscussion(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discussionId, payload }) => updateDiscussion(discussionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
    },
  });
}

export function useDeleteDiscussion(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discussionId) => deleteDiscussion(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}

export function useDeleteDiscussionReply(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => deleteDiscussionReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISCUSSIONS, courseId],
      });
    },
  });
}
