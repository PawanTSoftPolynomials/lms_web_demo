import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateCourse } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useUpdateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         courseId,
                         courseData,
                     }) =>
            updateCourse(
                courseId,
                courseData
            ),

        onSuccess: (response, variables) => {
            // The backend PUT response already carries the freshly-updated
            // course (course.controller.js's updateCourse returns { data: course }),
            // but it's a bare prisma.course.update() with no `include` — no
            // modules/quizzes/creator/store/etc relations. Merge it into
            // whatever's already cached (from getCourseById's richer include)
            // instead of replacing the entry outright, so the Composer reflects
            // the new title/description the instant this resolves — no wait on
            // a follow-up refetch — without dropping the relational fields only
            // getCourseById ever populated.
            const updatedCourse = response?.data;
            if (updatedCourse) {
                queryClient.setQueryData(
                    [QUERY_KEYS.COURSE, variables.courseId],
                    (old) => (old ? { ...old, ...updatedCourse } : updatedCourse)
                );
            }

            // List/dashboard views aren't shown mid-edit, so a background
            // refresh (rather than a synchronous cache write) is fine here.
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.INSTRUCTOR_DASHBOARD],
            });
        },
    });
}
