import { useQuery } from "@tanstack/react-query";

import { getStudentCertificates } from "@/services/student.service";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export default function useCertificates() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_CERTIFICATES],
    queryFn: async () => {
      const response = await getStudentCertificates();
      const certificates = response?.data || response;

      return Array.isArray(certificates) ? certificates : [];
    },
    ...defaultQueryOptions,
  });
}
