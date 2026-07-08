import { useQuery } from "@tanstack/react-query";

import { getLessonById } from "@/services/lesson.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useLesson(lessonId) {
    return useQuery({
        queryKey: [QUERY_KEYS.LESSON, lessonId],
        queryFn: () => getLessonById(lessonId),
        enabled: !!lessonId,
        ...defaultQueryOptions,
    });
}