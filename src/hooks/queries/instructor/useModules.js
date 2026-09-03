import { useQuery } from "@tanstack/react-query";

import { getModules } from "@/services/module.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useModules(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.MODULES, courseId],
        queryFn: () => getModules(courseId),
        enabled: !!courseId && courseId !== "draft" && courseId !== "new",
        ...defaultQueryOptions,
        // See useInstructorCourse.js for why this is scoped here rather
        // than in the app-wide default: this is the Course Map's module/
        // lesson/topic structure, and without refetchOnMount a course
        // revisited later in the same session shows whatever was cached at
        // first visit, not persisted changes made since.
        refetchOnMount: true,
    });
}