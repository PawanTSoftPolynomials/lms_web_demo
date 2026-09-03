import { useQuery } from "@tanstack/react-query";

import { getCourseById } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorCourse(courseId) {
    return useQuery({
        queryKey: [QUERY_KEYS.COURSE, courseId],
        queryFn: () => getCourseById(courseId),
        enabled: !!courseId && courseId !== "draft" && courseId !== "new",
        ...defaultQueryOptions,
        // This is the Course Composer's source of quiz + question data
        // (module/lesson/topic-level quiz question counts are read from
        // this query's data, via page.jsx's effectiveModules fallback — see
        // module.service.js's getModules, which never includes quiz data at
        // all). The app-wide default disables refetchOnMount, so once this
        // query is cached for a course, re-opening that course later in the
        // same session shows whatever was cached at first visit — even if
        // real quiz questions or content were added afterward (by AI
        // generation, another session, or anything else). Re-enabling
        // refetchOnMount here (scoped to just this query, not the app-wide
        // default) makes a stale-but-cached course refetch in the
        // background on remount, while staleTime still avoids refetching on
        // every rapid remount within the window.
        refetchOnMount: true,
    });
}