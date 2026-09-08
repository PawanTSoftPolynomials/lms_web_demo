import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderContents } from "@/services/content.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useReorderContents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contents }) =>
            reorderContents(contents),

        onSuccess: (_, variables) => {
            // variables.parent is the {parentType, parentId} shape every new
            // caller passes; older callers (the legacy composer/blocks system)
            // instead pass a bare topicId/lessonId/moduleId/courseId field —
            // fall back through those so their cache invalidation still
            // resolves to a real key instead of silently matching nothing.
            const parentType = variables.parent?.parentType
                ?? (variables.topicId ? "topic"
                    : variables.lessonId ? "lesson"
                    : variables.moduleId ? "module"
                    : variables.courseId ? "course"
                    : undefined);
            const parentId = variables.parent?.parentId
                ?? variables.topicId ?? variables.lessonId ?? variables.moduleId ?? variables.courseId;

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CONTENTS, parentType, parentId],
                refetchType: "all",
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MODULES],
                refetchType: "all",
            });
        },
    });
}
