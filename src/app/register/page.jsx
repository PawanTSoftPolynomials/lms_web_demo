"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineUserPlus } from "react-icons/hi2";

import useAuth from "@/hooks/useAuth";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthInput from "@/components/auth/AuthInput";
import PasswordFields from "@/components/auth/PasswordFields";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthButton from "@/components/auth/AuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.address.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      router.replace(
        `/verify-otp?email=${encodeURIComponent(
          formData.email.trim()
        )}`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed."
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
            <HiOutlineUserPlus className="text-4xl text-orange-500" />
          }
          title="Create Account"
          description="Create your Orange Tree LMS account."
        />

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <AuthAlert
            type="error"
            message={error}
          />

          <AuthInput
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <AuthInput
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <AuthInput
            label="Address"
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <PasswordFields
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onPasswordChange={(e) =>
              handleChange({
                target: {
                  name: "password",
                  value: e.target.value,
                },
              })
            }
            onConfirmPasswordChange={(e) =>
              handleChange({
                target: {
                  name: "confirmPassword",
                  value: e.target.value,
                },
              })
            }
            passwordLabel="Password"
            passwordPlaceholder="Enter your password"
            confirmPasswordLabel="Confirm Password"
            confirmPasswordPlaceholder="Confirm your password"
          />

          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Creating Account..."
          >
            Register
          </AuthButton>

          <AuthFooter
            question="Already have an account?"
            actionHref="/login"
            actionText="Login"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}