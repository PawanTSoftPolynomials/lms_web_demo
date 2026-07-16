import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";
import { getStudentState } from "@/services/student.service";

export default function useStudentState() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_STATE],
    queryFn: getStudentState,
    ...defaultQueryOptions,
  });
}
