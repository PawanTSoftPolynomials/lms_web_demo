"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineKey } from "react-icons/hi2";

import { resetPassword } from "@/services/auth.service";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthInput from "@/components/auth/AuthInput";
import PasswordFields from "@/components/auth/PasswordFields";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  // Keep the rest of your existing component exactly the same.
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Invalid password reset session. Please request a new OTP.");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email,
        otp: otp.trim(),
        newPassword,
      });

      setSuccess(response.message || "Password reset successfully.");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={<HiOutlineKey className="text-4xl text-orange-500" />}
          title="Reset Password"
          description="Enter the verification code sent to your email and create a new password."
        />

        {email && (
          <div className="mt-5 text-center">
            <div className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2">
              <span className="break-all text-sm font-medium text-orange-400">
                {email}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <AuthAlert type="error" message={error} />

          <AuthAlert type="success" message={success} />

          <AuthInput
            label="Verification Code"
            type="text"
            name="otp"
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
          />

          <PasswordFields
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={(e) => setNewPassword(e.target.value)}
            onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
            passwordLabel="New Password"
            passwordPlaceholder="Enter new password"
            confirmPasswordLabel="Confirm Password"
            confirmPasswordPlaceholder="Confirm new password"
          />

          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Resetting..."
          >
            Reset Password
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
