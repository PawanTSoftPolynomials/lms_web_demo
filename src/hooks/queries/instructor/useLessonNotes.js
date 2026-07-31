import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createLessonNote,
    deleteLessonNote,
    getLessonNotes,
    updateLessonNote,
} from "@/services/lessonNote.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLessonNotes(lessonId) {
    return useQuery({
        queryKey: [QUERY_KEYS.LESSON_NOTES, lessonId],
        queryFn: () => getLessonNotes(lessonId),
        enabled: !!lessonId,
        ...defaultQueryOptions,
    });
}

export function useCreateLessonNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLessonNote,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_NOTES, variables.lessonId],
            });
        },
    });
}

export function useUpdateLessonNote(lessonId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, payload }) => updateLessonNote(noteId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_NOTES, lessonId],
            });
        },
    });
}

export function useDeleteLessonNote(lessonId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteId) => deleteLessonNote(noteId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LESSON_NOTES, lessonId],
            });
        },
    });
}
