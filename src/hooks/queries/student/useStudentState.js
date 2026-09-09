import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";
import { getStudentState } from "@/services/student.service";

export default function useStudentState(courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_STATE, courseId],
    queryFn: () => getStudentState(courseId),
    ...defaultQueryOptions,
  });
}
