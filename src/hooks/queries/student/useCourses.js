import useStoreCourses from "@/hooks/queries/student/useStoreCourses";

/**
 * The published course catalogue, as seen by a student.
 *
 * Delegates to useStoreCourses so both names resolve to one cache entry.
 *
 * This previously called getCourses() (a bare GET /courses) and then filtered
 * `status === "PUBLISHED"` in JS. Two problems with that:
 *
 *   1. GET /courses is paginated with a default limit of 10, so the catalogue
 *      silently stopped at 10 courses. The browse page showed 10, and the
 *      dashboard's "Recommended for You" carousel — which removes the courses
 *      you are already enrolled in — could come back empty for a student
 *      enrolled in 10 courses while the catalogue still had plenty.
 *   2. The client-side PUBLISHED filter was redundant: the backend already
 *      forces `status = "PUBLISHED"` for the STUDENT role.
 *
 * getStoreCourses() asks the server for the catalogue explicitly
 * (?limit=200&status=PUBLISHED), so the filtering happens in the database and
 * the page receives the full list it is meant to show.
 */
export default function useCourses() {
  return useStoreCourses();
}
