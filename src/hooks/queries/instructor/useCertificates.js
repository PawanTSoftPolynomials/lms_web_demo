import { useQuery } from "@tanstack/react-query";
import { getCertificates } from "@/services/certificate.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorCertificates(userId, courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CERTIFICATES || 'CERTIFICATES', userId, courseId],
    queryFn: async () => {
      const response = await getCertificates(userId, courseId);
      // Ensure we always return an array
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data || [];
    },
    ...defaultQueryOptions,
  });
}
