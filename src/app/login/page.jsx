"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineLockClosed } from "react-icons/hi2";

import useAuth from "@/hooks/useAuth";

import Loader from "@/components/common/Loader";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthAlert from "@/components/auth/AuthAlert";
import AuthInput from "@/components/auth/AuthInput";
import AuthFooter from "@/components/auth/AuthFooter";

import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      switch (user.role) {
        case "ADMIN":
          router.replace("/admin/dashboard");
          break;

        case "INSTRUCTOR":
          router.replace("/instructor/dashboard");
          break;

        default:
          router.replace("/student/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed";

      if (message === "Verify email first") {
        router.replace(
          `/verify-otp?email=${encodeURIComponent(
            formData.email.trim()
          )}`
        );
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader />
      </div>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          icon={
            <HiOutlineLockClosed className="text-4xl text-orange-500" />
          }
          title="Welcome Back"
          description="Sign in to continue your learning journey."
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
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-orange-500 hover:text-orange-400"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </Button>

          <AuthFooter
            question="Don't have an account?"
            actionHref="/register"
            actionText="Register"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}