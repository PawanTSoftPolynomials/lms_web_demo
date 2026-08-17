"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    generateEntryAssessment,
    getEntryAssessment,
    submitEntryAssessment,
    getEntryAssessmentResult,
} from "@/services/entryAssessment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useGenerateEntryAssessment(courseId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => generateEntryAssessment(courseId),
        onSuccess: (data) => {
            queryClient.setQueryData([QUERY_KEYS.ENTRY_ASSESSMENT, courseId], data);
        },
    });
}

export function useEntryAssessment(courseId, options = {}) {
    return useQuery({
        queryKey: [QUERY_KEYS.ENTRY_ASSESSMENT, courseId],
        queryFn: () => getEntryAssessment(courseId),
        enabled: Boolean(courseId) && options.enabled !== false,
        retry: false,
    });
}

export function useSubmitEntryAssessment(courseId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (answers) => submitEntryAssessment(courseId, answers),
        onSuccess: (data) => {
            queryClient.setQueryData([QUERY_KEYS.ENTRY_ASSESSMENT, courseId], data);
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_STATE, courseId] });
        },
    });
}

export function useEntryAssessmentResult(courseId, options = {}) {
    return useQuery({
        queryKey: [QUERY_KEYS.ENTRY_ASSESSMENT, courseId, "result"],
        queryFn: () => getEntryAssessmentResult(courseId),
        enabled: Boolean(courseId) && options.enabled !== false,
        retry: false,
    });
}
