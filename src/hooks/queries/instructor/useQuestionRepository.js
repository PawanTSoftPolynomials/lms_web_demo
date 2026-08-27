import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    getRepositoryQuestions,
    createRepositoryQuestion,
    duplicateRepositoryQuestion,
    archiveRepositoryQuestion,
    deleteRepositoryQuestion,
    uploadQuestionsFile,
    importQuestionsToQuiz,
    removeQuestionFromQuiz,
    reorderQuizQuestions,
    updateQuizQuestionMarks,
} from "@/services/questionRepository.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useRepositoryQuestions(filters = {}) {
    return useQuery({
        queryKey: [QUERY_KEYS.QUESTION_REPOSITORY, filters],
        queryFn: () => getRepositoryQuestions(filters),
        ...defaultQueryOptions,
    });
}

export function useCreateRepositoryQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRepositoryQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTION_REPOSITORY] });
        },
    });
}

export function useDuplicateRepositoryQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId) => duplicateRepositoryQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTION_REPOSITORY] });
        },
    });
}

export function useArchiveRepositoryQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId) => archiveRepositoryQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTION_REPOSITORY] });
        },
    });
}

export function useUploadQuestionsFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file) => uploadQuestionsFile(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTION_REPOSITORY] });
        },
    });
}

export function useImportQuestionsToQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, questionIds }) => importQuestionsToQuiz(quizId, questionIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZ, variables.quizId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTIONS, variables.quizId] });
        },
    });
}

export function useRemoveQuestionFromQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, questionId }) => removeQuestionFromQuiz(quizId, questionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZ, variables.quizId] });
        },
    });
}

export function useReorderQuizQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, orderedQuestionIds }) => reorderQuizQuestions(quizId, orderedQuestionIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZ, variables.quizId] });
        },
    });
}

export function useUpdateQuizQuestionMarks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, questionId, marks }) => updateQuizQuestionMarks(quizId, questionId, marks),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZ, variables.quizId] });
        },
    });
}

export function useDeleteRepositoryQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId) => deleteRepositoryQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTION_REPOSITORY] });
        },
    });
}
