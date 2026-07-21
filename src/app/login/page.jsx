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
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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

    // Client-side validations
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setValidationErrors({});

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("=================================");
      console.log("Logged in User:", user);
      console.log("User Role:", user?.role);
      console.log("Current URL:", window.location.pathname);
      console.log("=================================");

      switch (user.role) {
        case "ADMIN":
          console.log("Navigating to /admin/dashboard");
          router.replace("/admin/dashboard");
          break;

        case "INSTRUCTOR":
          console.log("Navigating to /instructor/dashboard");
          router.replace("/instructor/dashboard");
          break;

        case "STUDENT":
          console.log("Navigating to /student/dashboard");
          router.replace("/student/dashboard");
          break;

        default:
          console.error("Unknown role:", user.role);
          showToast(`Unknown role: ${user.role}`, "error", "Login Failed");
          return;
      }

      console.log("router.replace() executed");
    } catch (error) {
      console.error("Login Error:", error);

      const message = error.response?.data?.message || "Login failed";

      if (message === "Verify email first") {
        router.replace(
          `/verify-otp?email=${encodeURIComponent(formData.email.trim())}`,
        );
        return;
      }

      showToast("Invalid email or password.", "error", "Login Failed");
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
          icon={<HiOutlineLockClosed className="text-4xl text-orange-500" />}
          title="Welcome Back"
          description="Sign in to continue your learning journey."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <AuthInput
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-[11px] font-semibold mt-1.5 px-1 text-left animate-in fade-in duration-150">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <AuthInput
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-[11px] font-semibold mt-1.5 px-1 text-left animate-in fade-in duration-150">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-orange-500 hover:text-orange-400"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
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
