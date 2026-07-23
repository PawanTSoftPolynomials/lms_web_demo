import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/services/student.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useStudents() {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STUDENTS || "students"],
    queryFn: getStudents,
  });
}
