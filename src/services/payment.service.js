import api from "@/lib/axios";

/**
 * Create Payment Order
 * @param {string} courseId
 * @returns {Promise<{ orderId: string, amount: number, currency: string, keyId: string }>}
 */
export const createPaymentOrder = async (courseId) => {
  const { data } = await api.post("/payments/orders", { courseId });
  return data.data;
};

/**
 * Verify Payment
 * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} paymentData
 * @returns {Promise<{ paymentStatus: string, enrollmentStatus: string }>}
 */
export const verifyPayment = async (paymentData) => {
  const { data } = await api.post("/payments/verify", paymentData);
  return data.data;
};
