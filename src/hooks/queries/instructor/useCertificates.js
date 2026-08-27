import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCertificate, getCertificates, updateCertificate } from "@/services/certificate.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

export function useInstructorCertificates(userId, courseId) {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_CERTIFICATES, userId, courseId],
    queryFn: async () => {
      const response = await getCertificates(userId, courseId);
      // Ensure we always return an array
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data || [];
    },
    enabled: !!userId,
    ...defaultQueryOptions,
  });
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ certificateId, data }) => updateCertificate(certificateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_CERTIFICATES] });
    },
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateId) => deleteCertificate(certificateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_CERTIFICATES] });
    },
  });
}
