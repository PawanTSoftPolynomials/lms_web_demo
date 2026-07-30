import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLiveClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClass,
  updateLiveClassStatus,
  deleteLiveClass,
} from "@/services/liveClass.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLiveClasses(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.LIVE_CLASSES, { courseId }],
    queryFn: () => getLiveClasses({ courseId }),
    enabled: !!courseId,
    ...defaultQueryOptions,
  });
}

export function useLiveClass(id) {
  return useQuery({
    queryKey: [QUERY_KEYS.LIVE_CLASSES, id],
    queryFn: () => getLiveClassById(id),
    enabled: !!id,
    ...defaultQueryOptions,
  });
}

export function useCreateLiveClass(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createLiveClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIVE_CLASSES, { courseId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}

export function useUpdateLiveClass(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateLiveClass(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIVE_CLASSES, { courseId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}

export function useUpdateLiveClassStatus(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateLiveClassStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIVE_CLASSES, { courseId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}

export function useDeleteLiveClass(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLiveClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIVE_CLASSES, { courseId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
      });
    },
  });
}
