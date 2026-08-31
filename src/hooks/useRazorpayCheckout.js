"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { loadRazorpayScript } from "@/utils/loadRazorpayScript";
import { useCreatePaymentOrder, useVerifyPayment } from "@/hooks/queries/student/usePayment";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useRazorpayCheckout() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createOrderMutation = useCreatePaymentOrder();
  const verifyMutation = useVerifyPayment();

  // Payment UI States: IDLE | CREATING_ORDER | CHECKOUT_OPEN | VERIFYING_PAYMENT | SUCCESS | FAILED | CANCELLED
  const [paymentState, setPaymentState] = useState("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  const startCheckout = useCallback(
    async ({ courseId, courseTitle = "Course Access", returnPath, onSuccess }) => {
      setErrorMsg("");

      // 1. Authentication Check
      if (!user) {
        const targetPath = returnPath || `/student/courses/${courseId}`;
        if (typeof window !== "undefined") {
          sessionStorage.setItem("intended_course_return", targetPath);
        }
        router.push(`/login?returnTo=${encodeURIComponent(targetPath)}`);
        return;
      }

      // Prevent duplicate clicks if already processing
      if (
        paymentState === "CREATING_ORDER" ||
        paymentState === "CHECKOUT_OPEN" ||
        paymentState === "VERIFYING_PAYMENT"
      ) {
        return;
      }

      try {
        // 2. Load Razorpay Script
        setPaymentState("CREATING_ORDER");
        const isLoaded = await loadRazorpayScript();

        if (!isLoaded) {
          setPaymentState("FAILED");
          setErrorMsg("Failed to load Razorpay payment gateway. Please check your network connection.");
          return;
        }

        // 3. Create Payment Order on Backend
        const orderData = await createOrderMutation.mutateAsync(courseId);

        if (!orderData || !orderData.orderId) {
          setPaymentState("FAILED");
          setErrorMsg("Failed to generate payment order.");
          return;
        }

        // 4. Open Razorpay Checkout Modal
        setPaymentState("CHECKOUT_OPEN");

        const razorpayKey =
          orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Orange Tree LMS",
          description: courseTitle,
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: {
            color: "#f2c7c7", // Brand accent
          },
          handler: async function (response) {
            // User completed payment in Razorpay modal -> verify server-side
            setPaymentState("VERIFYING_PAYMENT");
            try {
              const verifyResult = await verifyMutation.mutateAsync({
                courseId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              setPaymentState("SUCCESS");
              if (onSuccess) {
                onSuccess(verifyResult);
              } else {
                router.push(`/student/learn/${courseId}`);
              }
            } catch (err) {
              setPaymentState("FAILED");
              setErrorMsg(
                err?.response?.data?.message ||
                  "Payment verification pending or failed. Please contact support if debited."
              );
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentState("CANCELLED");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setPaymentState("FAILED");
          setErrorMsg(response.error?.description || "Payment failed at checkout.");
        });
        rzp.open();
      } catch (err) {
        const backendMsg = err?.response?.data?.message;

        // Gracefully handle "Already enrolled in this course"
        if (backendMsg === "Already enrolled in this course") {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_COURSES] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, courseId] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DASHBOARD] });

          setPaymentState("SUCCESS");
          router.push(`/student/learn/${courseId}`);
          return;
        }

        setPaymentState("FAILED");
        setErrorMsg(backendMsg || err?.message || "Failed to process payment order.");
      }
    },
    [user, paymentState, router, createOrderMutation, verifyMutation, queryClient]
  );

  const getButtonLabel = (defaultLabel = "Buy Course") => {
    switch (paymentState) {
      case "CREATING_ORDER":
        return "Creating Order...";
      case "CHECKOUT_OPEN":
        return "Opening Payment...";
      case "VERIFYING_PAYMENT":
        return "Verifying Payment...";
      case "SUCCESS":
        return "Continue Learning";
      case "FAILED":
      case "CANCELLED":
        return "Retry Payment";
      default:
        return defaultLabel;
    }
  };

  const isProcessing =
    paymentState === "CREATING_ORDER" ||
    paymentState === "CHECKOUT_OPEN" ||
    paymentState === "VERIFYING_PAYMENT";

  return {
    startCheckout,
    paymentState,
    errorMsg,
    getButtonLabel,
    isProcessing,
    resetCheckout: () => {
      setPaymentState("IDLE");
      setErrorMsg("");
    },
  };
}

export default useRazorpayCheckout;
