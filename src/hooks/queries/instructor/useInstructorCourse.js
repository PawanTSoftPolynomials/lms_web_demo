import { useQuery } from "@tanstack/react-query";

import { getCourseById } from "@/services/course.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/**
 * One course.
 *
 * @param {string}  courseId
 * @param {object}  [options]
 * @param {boolean} [options.shallow=false]
 *   Fetch course metadata only, skipping the modules -> lessons -> topics ->
 *   contents tree. Use this wherever the view shows the course's name, status
 *   or settings but never renders its syllabus (breadcrumbs, the overview
 *   header, the edit form). The full tree includes every content cell body and
 *   every quiz question with its correct answer, so skipping it is a large
 *   payload saving on pages that were only ever reading the title.
 *
 *   Shallow and full results are cached under different keys, so a view that
 *   needs the tree (the Composer) is never handed a metadata-only course.
 */
export function useInstructorCourse(courseId, options = {}) {
    const { shallow = false, ...queryOptions } = options;

    return useQuery({
        queryKey: shallow
            ? [QUERY_KEYS.COURSE, courseId, "meta"]
            : [QUERY_KEYS.COURSE, courseId],
        queryFn: () => getCourseById(courseId, { shallow }),
        enabled: !!courseId && courseId !== "draft" && courseId !== "new",
        ...defaultQueryOptions,
        ...queryOptions,
    });
}
