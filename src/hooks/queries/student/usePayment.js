import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentOrder, verifyPayment } from "@/services/payment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (courseId) => createPaymentOrder(courseId),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData) => verifyPayment(paymentData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });
      if (variables?.courseId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, variables.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE] });
      }
    },
  });
}
