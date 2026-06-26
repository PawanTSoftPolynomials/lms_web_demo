"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineLockClosed } from "react-icons/hi2";

import { forgotPassword } from "@/services/auth.service";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthInput from "@/components/auth/AuthInput";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthButton from "@/components/auth/AuthButton";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());

      setSuccess(
        response.message || "OTP sent successfully."
      );

      setTimeout(() => {
        router.replace(
          `/reset-password?email=${encodeURIComponent(
            email.trim()
          )}`
        );
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={
            <HiOutlineLockClosed className="text-4xl text-orange-500" />
          }
          title="Forgot Password"
          description="Enter your registered email address. We'll send you a 6-digit OTP to reset your password."
        />

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <AuthAlert
            type="error"
            message={error}
          />

          <AuthAlert
            type="success"
            message={success}
          />

          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Sending OTP..."
          >
            Send OTP
          </AuthButton>

          <AuthFooter
            question="Remember your password?"
            actionHref="/login"
            actionText="Login"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}