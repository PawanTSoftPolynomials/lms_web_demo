import { useQuery } from "@tanstack/react-query";

import { getStudentProfile } from "@/services/student.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useProfile() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROFILE],
    queryFn: getStudentProfile,
    ...defaultQueryOptions,
  });
}